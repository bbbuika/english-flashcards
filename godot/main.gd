## main.gd — smoke-test entry point.
##
## Press F5 in Godot to run. Prints the demo state in the Output panel so you
## can verify the engine logic works. Build your real UI by replacing this
## script with scene nodes that read `game` state and call its methods.

extends Node

var game: AkitGame
var human_id: String

func _ready() -> void:
	randomize()
	game = AkitGame.new()
	game.state_changed.connect(_on_state_changed)
	game.log_entry_added.connect(_on_log)
	game.game_ended.connect(_on_game_ended)

	human_id = game.start_solo_demo("Sen")
	print("Sen (Kethüda candidate) = ", human_id)
	print("Aygucı = ", game.scorekeeper_id if game.scorekeeper_id != "" else "(seçilmedi)")
	print("Theme rune = ", game.find_card(game.theme_rune_id)["title"])
	for p in game.players:
		print("  - %s  hand=%d  score=%d  bot=%s" % [p["name"], p["hand"].size(), p["score"], p["is_bot"]])

	# Bot timer
	var t := Timer.new()
	t.wait_time = 2.0
	t.timeout.connect(game.tick_bots)
	add_child(t)
	t.start()

func _on_state_changed() -> void:
	pass

func _on_log(tr_msg: String, _en_msg: String) -> void:
	print("[log] ", tr_msg)

func _on_game_ended(winner_id: String) -> void:
	print("=== Oyun bitti. Kazanan: %s ===" % game._player_name(winner_id))
