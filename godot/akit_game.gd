## akit_game.gd
##
## Single-file game logic for "Gölgeli Sona Bir Adım" (Akit) — a Turkish
## storytelling card game with 65 cards across 8 categories. Place cards into
## six named slots (Mekan / Zaman / Kahraman / Şövalye / Olay / Olgu) and end
## the game by playing an ending rune.
##
## Drop this file anywhere in your Godot 4 project. Use it as either:
##
##   1. An autoload singleton — set in Project Settings → Autoload.
##   2. A regular RefCounted instance — `var game = AkitGame.new()`.
##
## The script holds the deck data, game state, rules engine, and a basic bot.
## It is UI-free: emit signals tell your scene tree what to redraw.
##
## Card images are not bundled — see CARDS[i].file for the filename each card
## expects (e.g. `res://cards/6.jpg`). Copy them from the web app's
## `public/cards/` directory.

class_name AkitGame
extends RefCounted

# ============================================================================
# Enums and constants
# ============================================================================

enum Niyet { STRATEJI, UZLASMA }
enum Zorluk { KOLAY, ZOR }
enum Phase { LOBBY, PLAYING, ENDED }
enum Pile { MAIN, RUNE }

const SLOTS := ["mekan", "zaman", "kahraman", "sovalye", "olay", "olgu"]

const SLOT_LABELS_TR := {
	"mekan": "Mekan", "zaman": "Zaman", "kahraman": "Kahraman",
	"sovalye": "Şövalye", "olay": "Olay", "olgu": "Olgu",
}
const SLOT_LABELS_EN := {
	"mekan": "Location", "zaman": "Time", "kahraman": "Hero",
	"sovalye": "Knight", "olay": "Event", "olgu": "Fact",
}

const DEFAULT_HAND_SIZE := 7
const DEFAULT_TOKENS_PER_PLAYER := 3

# Starting points per (Niyet, Zorluk, playerCount).
const STRATEGY_START := {
	Zorluk.ZOR: { 2: 128, 3: 81, 4: 69 },
	Zorluk.KOLAY: { 2: 165, 3: 99, 4: 86 },
}
const RECONCILIATION_START := { 2: 12, 3: 18, 4: 24 }

# Suggested bot display names.
const BOT_NAMES := ["Yarlık", "Mergen", "Umay", "Kızagan", "Ayaz", "Erlik"]

# ============================================================================
# Deck definition — 65 cards
# ============================================================================
#
# Each entry: { id, file, title, number, subtitle, category }.
# `id` matches `file` minus the extension and is used everywhere in state.
# `category` is one of:
#   dichotomic | element | iye | rune | god | hero | month | erk
#
const CARDS := [
	{ "id": "6",  "file": "6.jpg",  "title": "YARUK",        "number": 0,  "subtitle": "Evrensel Düzen Sembolü",          "category": "dichotomic" },
	{ "id": "7",  "file": "7.jpg",  "title": "KARARIG",      "number": 0,  "subtitle": "Evrensel Kaos Sembolü",           "category": "dichotomic" },
	{ "id": "8",  "file": "8.jpg",  "title": "ATEŞ",         "number": 1,  "subtitle": "Başlama - Tetik - Hız",           "category": "element" },
	{ "id": "9",  "file": "9.jpg",  "title": "TOPRAK",       "number": 5,  "subtitle": "Sürdürme - İstikrar - Liyakat",   "category": "element" },
	{ "id": "10", "file": "10.jpg", "title": "HAVA",         "number": 13, "subtitle": "Uzmanlaşma - Akıl - Kararsızlık", "category": "element" },
	{ "id": "11", "file": "11.jpg", "title": "SU",           "number": 11, "subtitle": "Tamamlama - Bitiş - Duygusallık", "category": "element" },
	{ "id": "12", "file": "12.jpg", "title": "MADEN",        "number": 4,  "subtitle": "Katılık - Yaratım - Şekil Verme", "category": "element" },
	{ "id": "13", "file": "13.jpg", "title": "YOL İYESİ",    "number": 6,  "subtitle": "Saygı - İstikrar - Ulaşmak",      "category": "iye" },
	{ "id": "14", "file": "14.jpg", "title": "OD İYESİ",     "number": 3,  "subtitle": "Saygı - Başlatma - Koruma",       "category": "iye" },
	{ "id": "15", "file": "15.jpg", "title": "SU İYESİ",     "number": 3,  "subtitle": "Sevgi - Hoşgörü - Arıtma",        "category": "iye" },
	{ "id": "16", "file": "16.jpg", "title": "HAMAM İYESİ",  "number": 11, "subtitle": "Hijyen - Temizlik - Sakınma",     "category": "iye" },
	{ "id": "17", "file": "17.jpg", "title": "KIR İYESİ",    "number": 13, "subtitle": "Yalnızlık - Asilik - Koruma",     "category": "iye" },
	{ "id": "18", "file": "18.jpg", "title": "EV İYESİ",     "number": 11, "subtitle": "Tüten Ocak - Bereket - Sahiplik", "category": "iye" },
	{ "id": "19", "file": "19.jpg", "title": "ORMAN İYESİ",  "number": 3,  "subtitle": "Topluluk - Ferahlık - Güven",     "category": "iye" },
	{ "id": "20", "file": "20.jpg", "title": "MADEN İYESİ",  "number": 4,  "subtitle": "Korku - Başarı - Cevher",         "category": "iye" },
	{ "id": "21", "file": "21.jpg", "title": "FARE",         "number": 12, "subtitle": "Ocak Ayı - Başlangıç - Gizli Bereket",     "category": "month" },
	{ "id": "22", "file": "22.jpg", "title": "BOĞA",         "number": 5,  "subtitle": "Şubat Ayı - Analitik - Algı",              "category": "month" },
	{ "id": "23", "file": "23.jpg", "title": "KAPLAN",       "number": 9,  "subtitle": "Mart Ayı - Savaşçı - Asilik",              "category": "month" },
	{ "id": "24", "file": "24.jpg", "title": "TAVŞAN",       "number": 10, "subtitle": "Nisan Ayı - Uzlaşmacı - Saadet",           "category": "month" },
	{ "id": "25", "file": "25.jpg", "title": "EJDERHA",      "number": 1,  "subtitle": "Mayıs Ayı - Yönetici - Kibir",             "category": "month" },
	{ "id": "26", "file": "26.jpg", "title": "YILAN",        "number": 2,  "subtitle": "Haziran Ayı - Şifacı - Ruhani",            "category": "month" },
	{ "id": "27", "file": "27.jpg", "title": "AT",           "number": 9,  "subtitle": "Temmuz Ayı - Hareketli - Sezgisel",        "category": "month" },
	{ "id": "28", "file": "28.jpg", "title": "KOYUN",        "number": 10, "subtitle": "Ağustos Ayı - Zihinsel Üretim - Tedbir",   "category": "month" },
	{ "id": "29", "file": "29.jpg", "title": "MAYMUN",       "number": 14, "subtitle": "Eylül Ayı - Gezgin - Sıkılgan",            "category": "month" },
	{ "id": "30", "file": "30.jpg", "title": "HOROZ",        "number": 6,  "subtitle": "Ekim Ayı - Lider - Kafa Tutma",            "category": "month" },
	{ "id": "31", "file": "31.jpg", "title": "KÖPEK",        "number": 10, "subtitle": "Kasım Ayı - Güven - Disiplin",             "category": "month" },
	{ "id": "32", "file": "32.jpg", "title": "DOMUZ",        "number": 12, "subtitle": "Aralık Ayı - Üretken - Ilımlı",            "category": "month" },
	{ "id": "33", "file": "33.jpg", "title": "ÖZÜT",         "number": 0,  "subtitle": "3. Ruh - Yanan Alev - Bütüncül",       "category": "god" },
	{ "id": "34", "file": "34.jpg", "title": "SÜNNE",        "number": 0,  "subtitle": "2. Ruh - Gümüş At - Ajan",             "category": "god" },
	{ "id": "35", "file": "35.jpg", "title": "SÜLDE",        "number": 0,  "subtitle": "1. Ruh - Karar Alıcı - Sahip",         "category": "god" },
	{ "id": "36", "file": "36.jpg", "title": "ÜLGEN",        "number": 9,  "subtitle": "Kral - Uçmağın Koruyucusu - Fırtına",  "category": "god" },
	{ "id": "37", "file": "37.jpg", "title": "ERLİK",        "number": 2,  "subtitle": "Yeraltı - Kaos - Günah",               "category": "god" },
	{ "id": "38", "file": "38.jpg", "title": "UMAY",         "number": 7,  "subtitle": "Savaş - Hal Örtüsü - Koruma",          "category": "god" },
	{ "id": "39", "file": "39.jpg", "title": "YAYIK",        "number": 13, "subtitle": "Ulak - İletişim - Ruh Taşıyıcı",       "category": "god" },
	{ "id": "40", "file": "40.jpg", "title": "KÜN ANA",      "number": 7,  "subtitle": "Güneş - Güç - Güzellik",               "category": "god" },
	{ "id": "41", "file": "41.jpg", "title": "AY DEDE",      "number": 12, "subtitle": "Belirsizlik - Duygu - Yansıtma",       "category": "god" },
	{ "id": "42", "file": "42.jpg", "title": "YARLIK",       "number": 6,  "subtitle": "Adalet - Düzen - Eşitlik",             "category": "god" },
	{ "id": "43", "file": "43.jpg", "title": "MERGEN",       "number": 8,  "subtitle": "Evrenin Hafızası - Akıl - Duyu",       "category": "god" },
	{ "id": "44", "file": "44.jpg", "title": "KIZAGAN",      "number": 8,  "subtitle": "Savaş - Alp - Alan Açma",              "category": "god" },
	{ "id": "45", "file": "45.jpg", "title": "AK ENE",       "number": 1,  "subtitle": "Yaratım İlhamı - Su - Başlangıç",      "category": "god" },
	{ "id": "46", "file": "46.jpg", "title": "ÖD TENGRİ",    "number": 8,  "subtitle": "Zaman - Koruma - Ejderha",             "category": "god" },
	{ "id": "47", "file": "47.jpg", "title": "AYAZ ATA",     "number": 16, "subtitle": "Yakıcı Soğuk - Hediye - Yanan Ocak",   "category": "god" },
	{ "id": "48", "file": "48.jpg", "title": "KAM",          "number": 5,  "subtitle": "Erk - Kanal - Paklık",                 "category": "god" },
	{ "id": "49", "file": "49.jpg", "title": "GEYİK",        "number": 14, "subtitle": "Erk - Dağ İyesinin Formu - Sabitlik",     "category": "erk" },
	{ "id": "50", "file": "50.jpg", "title": "AYI",          "number": 14, "subtitle": "Erk - Orman İyesinin Formu - Güven",      "category": "erk" },
	{ "id": "51", "file": "51.jpg", "title": "KUNDUZ",       "number": 2,  "subtitle": "Erk - Akarsu İyesinin Formu - İkircik",   "category": "erk" },
	{ "id": "52", "file": "52.jpg", "title": "KURT",         "number": 7,  "subtitle": "Erk - Uçmağın Erk Formu - Yükseliş",      "category": "erk" },
	{ "id": "53", "file": "53.jpg", "title": "KÜRŞAD",       "number": 17, "subtitle": "4. Çakra - Tutucu - Asi",          "category": "hero" },
	{ "id": "54", "file": "54.jpg", "title": "KÖROĞLU",      "number": 17, "subtitle": "7. Çakra - Ruhsal - Sanatçı",      "category": "hero" },
	{ "id": "55", "file": "55.jpg", "title": "KELOĞLAN",     "number": 15, "subtitle": "3. Çakra - Oyuncu - Pratik Zeka",  "category": "hero" },
	{ "id": "56", "file": "56.jpg", "title": "DELİ DUMRUL",  "number": 16, "subtitle": "2. Çakra - Aşık - Empatik",        "category": "hero" },
	{ "id": "57", "file": "57.jpg", "title": "DEDE KORKUT",  "number": 16, "subtitle": "9. Çakra - Bilge - Çocuksu",       "category": "hero" },
	{ "id": "58", "file": "58.jpg", "title": "GESAR",        "number": 4,  "subtitle": "1. Çakra - Lider - Aydınlanmış",   "category": "hero" },
	{ "id": "59", "file": "59.jpg", "title": "TOMRİS",       "number": 17, "subtitle": "6. Çakra - Ebeveyn - İntikam",     "category": "hero" },
	{ "id": "60", "file": "60.jpg", "title": "BALAMİR",      "number": 15, "subtitle": "8. Çakra - Dünyevi - Yönetim",     "category": "hero" },
	{ "id": "61", "file": "61.jpg", "title": "TONYUKUK",     "number": 15, "subtitle": "5. Çakra - Köklü Yenilik - Merak", "category": "hero" },
	{ "id": "62", "file": "62.jpg", "title": "KUT",          "number": 0,  "subtitle": "Özne - İlahi - Yüce",         "category": "god" },
	{ "id": "63", "file": "63.jpg", "title": "MAYTERE",      "number": 0,  "subtitle": "Özne - Kurtarıcı - Öğretmen", "category": "god" },
	{ "id": "64", "file": "64.jpg", "title": "UZLAŞMA",      "number": 0,  "subtitle": "Rün - Barış - Egemenlik",          "category": "rune" },
	{ "id": "65", "file": "65.jpg", "title": "BİTİRME",      "number": 0,  "subtitle": "Rün - Nokta - Sonlandırma",        "category": "rune" },
	{ "id": "66", "file": "66.jpg", "title": "EDİNME",       "number": 0,  "subtitle": "Rün - Kavrayış - Algılama",        "category": "rune" },
	{ "id": "67", "file": "67.jpg", "title": "YAŞAM",        "number": 0,  "subtitle": "Rün - Yaşam Başlangıcı - Su",      "category": "rune" },
	{ "id": "68", "file": "68.jpg", "title": "YARATIM",      "number": 0,  "subtitle": "Rün - Doğrusal Akış - Hayalgücü",  "category": "rune" },
	{ "id": "69", "file": "69.jpg", "title": "İSYAN",        "number": 0,  "subtitle": "Rün - Değiştirme Azmi - Farklı Bakış", "category": "rune" },
	{ "id": "70", "file": "70.jpg", "title": "ÖLÜM",         "number": 0,  "subtitle": "Rün - Değişim - Suya Dönüş",       "category": "rune" },
]

# ============================================================================
# Signals
# ============================================================================

signal state_changed                              ## Emitted after any mutation.
signal log_entry_added(tr: String, en: String)    ## Emitted with each log line.
signal game_started
signal game_ended(winner_id: String)

# ============================================================================
# State
# ============================================================================

var phase: Phase = Phase.LOBBY
var niyet: Niyet = Niyet.UZLASMA
var zorluk: Zorluk = Zorluk.KOLAY
var players: Array = []          ## Each: see _make_player()
var host_id: String = ""
var scorekeeper_id: String = ""
var theme_rune_id: String = ""
var main_deck: Array = []        ## Card IDs.
var rune_deck: Array = []        ## Card IDs.
var board: Dictionary = {}       ## slot -> Array of card IDs (stacked).
var story_sequence: Array = []   ## Ordered list of plays.
var current_turn_player_id: String = ""
var winner_id: String = ""
var log: Array = []              ## Each: { ts, tr, en }

# ============================================================================
# Public API — lifecycle
# ============================================================================

func _init() -> void:
	board = _empty_board()

## Add a human player. Returns the assigned id.
func add_player(player_name: String, is_bot: bool = false) -> String:
	if phase != Phase.LOBBY:
		return ""
	if players.size() >= 4:
		return ""
	var id := "p_%d_%d" % [Time.get_unix_time_from_system(), randi() % 100000]
	var p := _make_player(id, player_name, is_bot)
	if players.is_empty():
		p["is_host"] = true
		host_id = id
	players.append(p)
	_log("%s odaya katıldı." % player_name, "%s joined." % player_name)
	state_changed.emit()
	return id

## Convenience: spin up a solo demo game vs 3 bots. Returns the human's id.
func start_solo_demo(human_name: String = "Sen") -> String:
	players.clear()
	board = _empty_board()
	var human_id := add_player(human_name, false)
	for i in 3:
		add_player(BOT_NAMES[(i + randi()) % BOT_NAMES.size()] + " 🤖", true)
	start_game()
	return human_id

func set_niyet(value: Niyet) -> void:
	if phase != Phase.LOBBY: return
	niyet = value
	state_changed.emit()

func set_zorluk(value: Zorluk) -> void:
	if phase != Phase.LOBBY: return
	zorluk = value
	state_changed.emit()

func set_scorekeeper(target_id: String) -> void:
	if phase != Phase.LOBBY: return
	scorekeeper_id = target_id
	for p in players:
		p["is_scorekeeper"] = (p["id"] == target_id)
	state_changed.emit()

## Deal cards, draw theme rune, transition to PLAYING phase.
func start_game() -> bool:
	if phase != Phase.LOBBY: return false
	if players.size() < 2: return false

	# Separate runes from main cards.
	var runes: Array = []
	var mains: Array = []
	for c in CARDS:
		if c["category"] == "rune":
			runes.append(c["id"])
		else:
			mains.append(c["id"])
	_shuffle(runes)
	_shuffle(mains)

	theme_rune_id = runes.pop_front()
	rune_deck = runes

	# Deal hands from main pile.
	var starting := _starting_score(players.size())
	for p in players:
		p["hand"] = []
		for i in DEFAULT_HAND_SIZE:
			if mains.is_empty(): break
			p["hand"].append(mains.pop_front())
		p["score"] = starting
		p["tokens_didnt"] = DEFAULT_TOKENS_PER_PLAYER
		p["tokens_did"] = DEFAULT_TOKENS_PER_PLAYER
	main_deck = mains

	board = _empty_board()
	story_sequence.clear()
	winner_id = ""

	# Random first turn.
	current_turn_player_id = players[randi() % players.size()]["id"]
	phase = Phase.PLAYING

	var starter_name := _player_name(current_turn_player_id)
	_log("Oyun başladı. İlk sıra: %s." % starter_name, "Game started. First turn: %s." % starter_name)
	game_started.emit()
	state_changed.emit()
	return true

## Reset the room to LOBBY without dropping players.
func new_round() -> void:
	phase = Phase.LOBBY
	theme_rune_id = ""
	main_deck.clear()
	rune_deck.clear()
	board = _empty_board()
	story_sequence.clear()
	winner_id = ""
	for p in players:
		p["hand"] = []
		p["score"] = 0
		p["tokens_didnt"] = 0
		p["tokens_did"] = 0
	_log("Yeni tur için lobiye dönüldü.", "Returned to lobby for a new round.")
	state_changed.emit()

# ============================================================================
# Public API — gameplay
# ============================================================================

## Place a card from your hand into a board slot.
func play_card(player_id: String, card_id: String, slot: String) -> bool:
	if phase != Phase.PLAYING: return false
	if current_turn_player_id != player_id: return false
	if not SLOTS.has(slot): return false
	var p := _find_player(player_id)
	if p.is_empty(): return false
	if not p["hand"].has(card_id): return false
	var card := find_card(card_id)
	if card.is_empty(): return false

	p["hand"].erase(card_id)
	board[slot].append(card_id)
	story_sequence.append({
		"card_id": card_id,
		"played_by": player_id,
		"slot": slot,
		"ts": Time.get_unix_time_from_system(),
	})

	var value: int = card["number"] if card["number"] > 0 else 3
	if niyet == Niyet.STRATEJI:
		p["score"] = max(0, p["score"] - value)
	else:
		p["score"] += value

	if is_ending_rune(card):
		phase = Phase.ENDED
		winner_id = _compute_winner()
		_log("%s oyunu bitirdi: %s." % [p["name"], card["title"]],
			"%s ended the game: %s." % [p["name"], card["title"]])
		game_ended.emit(winner_id)
		state_changed.emit()
		return true

	# Rotate turn.
	var idx := players.find(p)
	current_turn_player_id = players[(idx + 1) % players.size()]["id"]

	_log("%s %s → %s." % [p["name"], card["title"], slot],
		"%s played %s → %s." % [p["name"], card["title"], slot])
	state_changed.emit()
	return true

## Draw a card from one of the two piles into your hand.
func draw_card(player_id: String, pile: Pile = Pile.MAIN) -> bool:
	if phase != Phase.PLAYING: return false
	var p := _find_player(player_id)
	if p.is_empty(): return false
	var deck: Array = rune_deck if pile == Pile.RUNE else main_deck
	if deck.is_empty(): return false
	var card_id: String = deck.pop_front()
	p["hand"].append(card_id)
	var pile_name := "rün" if pile == Pile.RUNE else "kart"
	_log("%s %s çekti." % [p["name"], pile_name],
		"%s drew a %s." % [p["name"], "rune" if pile == Pile.RUNE else "card"])
	state_changed.emit()
	return true

## Pass without playing. Turn rotates.
func pass_turn(player_id: String) -> bool:
	if phase != Phase.PLAYING: return false
	if current_turn_player_id != player_id: return false
	var idx := -1
	for i in players.size():
		if players[i]["id"] == player_id: idx = i
	if idx == -1: return false
	current_turn_player_id = players[(idx + 1) % players.size()]["id"]
	_log("%s sırayı geçti." % _player_name(player_id),
		"%s passed." % _player_name(player_id))
	state_changed.emit()
	return true

## Spend an "Olay Öyle Olmadı" token. In Strategy mode the target also loses 3
## from their score; in Reconciliation it's −3 from the score.
func spend_didnt_happen(spender_id: String, target_id: String) -> bool:
	if phase != Phase.PLAYING: return false
	var sp := _find_player(spender_id)
	var tg := _find_player(target_id)
	if sp.is_empty() or tg.is_empty(): return false
	if sp["tokens_didnt"] <= 0: return false
	sp["tokens_didnt"] -= 1
	if niyet == Niyet.STRATEJI:
		tg["score"] = max(0, tg["score"] - 3)
	else:
		tg["score"] -= 3
	_log('%s: "Olay öyle olmadı!" (%s −3)' % [sp["name"], tg["name"]],
		'%s: "It didn\'t happen that way!" (%s −3)' % [sp["name"], tg["name"]])
	state_changed.emit()
	return true

## Spend an "Olay Böyle Oldu" token. Always +2 to the target.
func spend_did_happen(spender_id: String, target_id: String) -> bool:
	if phase != Phase.PLAYING: return false
	var sp := _find_player(spender_id)
	var tg := _find_player(target_id)
	if sp.is_empty() or tg.is_empty(): return false
	if sp["tokens_did"] <= 0: return false
	sp["tokens_did"] -= 1
	tg["score"] += 2
	_log('%s: "Olay böyle oldu!" (%s +2)' % [sp["name"], tg["name"]],
		'%s: "It happened this way!" (%s +2)' % [sp["name"], tg["name"]])
	state_changed.emit()
	return true

## Host-initiated end-of-game. Whoever the winner formula picks gets the win.
func end_game_now(host_caller_id: String) -> bool:
	if phase != Phase.PLAYING: return false
	if host_caller_id != host_id: return false
	phase = Phase.ENDED
	winner_id = _compute_winner()
	_log("Oyun bitti.", "Game over.")
	game_ended.emit(winner_id)
	state_changed.emit()
	return true

# ============================================================================
# Bot AI
# ============================================================================

## Make the bot whose turn it currently is take an action.
##   - If hand is empty: draw (sometimes from the rune pile, mostly from main).
##   - Otherwise: play a random card from hand into a random slot.
## Call this on a Timer so it runs periodically while the game is active.
##
##   var timer = Timer.new()
##   timer.wait_time = 2.0
##   timer.timeout.connect(game.tick_bots)
##   add_child(timer); timer.start()
func tick_bots() -> void:
	if phase != Phase.PLAYING: return
	var p := _find_player(current_turn_player_id)
	if p.is_empty() or not p.get("is_bot", false): return

	# Throttle bots so two of them don't fire back-to-back in the same frame.
	if log.size() > 0 and Time.get_unix_time_from_system() - log[log.size() - 1]["ts"] < 1.5:
		return

	if p["hand"].is_empty():
		var pile := Pile.RUNE if randf() < 0.2 else Pile.MAIN
		draw_card(p["id"], pile)
		return
	var card_id: String = p["hand"][randi() % p["hand"].size()]
	var slot: String = SLOTS[randi() % SLOTS.size()]
	play_card(p["id"], card_id, slot)

# ============================================================================
# Helpers (public)
# ============================================================================

## Look up a card definition by id. Returns {} if missing.
func find_card(card_id: String) -> Dictionary:
	for c in CARDS:
		if c["id"] == card_id: return c
	return {}

func is_ending_rune(card: Dictionary) -> bool:
	if card.is_empty() or card["category"] != "rune": return false
	var t: String = card["title"].to_lower()
	return t.find("bitirme") != -1 or t.find("bitiş") != -1 or t.find("ölüm") != -1

## Convenience for UI: produce the image path for a card.
func card_image_path(card_id: String, root: String = "res://cards/") -> String:
	var c := find_card(card_id)
	if c.is_empty(): return ""
	return root + c["file"]

## Path to the main-deck card back.
func main_back_path(root: String = "res://cards/") -> String:
	return root + "back.jpg"

## Path to the rune-deck card back.
func rune_back_path(root: String = "res://cards/") -> String:
	return root + "back-rune.jpg"

## Slot display label.
func slot_label(slot: String, lang: String = "tr") -> String:
	if lang == "en": return SLOT_LABELS_EN.get(slot, slot)
	return SLOT_LABELS_TR.get(slot, slot)

# ============================================================================
# Internals
# ============================================================================

func _make_player(id: String, n: String, is_bot: bool) -> Dictionary:
	return {
		"id": id,
		"name": n.strip_edges().substr(0, 24),
		"is_host": false,
		"is_bot": is_bot,
		"is_scorekeeper": false,
		"score": 0,
		"hand": [],
		"tokens_didnt": 0,
		"tokens_did": 0,
	}

func _find_player(id: String) -> Dictionary:
	for p in players:
		if p["id"] == id: return p
	return {}

func _player_name(id: String) -> String:
	var p := _find_player(id)
	return p["name"] if not p.is_empty() else "?"

func _empty_board() -> Dictionary:
	return {
		"mekan": [], "zaman": [], "kahraman": [],
		"sovalye": [], "olay": [], "olgu": [],
	}

func _starting_score(player_count: int) -> int:
	var n: int = clamp(player_count, 2, 4)
	if niyet == Niyet.STRATEJI:
		return STRATEGY_START[zorluk][n]
	return RECONCILIATION_START[n]

func _compute_winner() -> String:
	if players.is_empty(): return ""
	if niyet == Niyet.STRATEJI:
		var zeroed := []
		for p in players:
			if p["score"] <= 0: zeroed.append(p)
		if not zeroed.is_empty():
			var best: Dictionary = zeroed[0]
			for p in zeroed:
				if p["score"] <= best["score"]: best = p
			return best["id"]
		var lowest: Dictionary = players[0]
		for p in players:
			if p["score"] < lowest["score"]: lowest = p
		return lowest["id"]
	# Uzlaşma — highest wins.
	var highest: Dictionary = players[0]
	for p in players:
		if p["score"] > highest["score"]: highest = p
	return highest["id"]

func _shuffle(arr: Array) -> void:
	for i in range(arr.size() - 1, 0, -1):
		var j := randi() % (i + 1)
		var tmp = arr[i]
		arr[i] = arr[j]
		arr[j] = tmp

func _log(tr_msg: String, en_msg: String) -> void:
	var entry := {
		"ts": Time.get_unix_time_from_system(),
		"tr": tr_msg,
		"en": en_msg,
	}
	log.append(entry)
	log_entry_added.emit(tr_msg, en_msg)
