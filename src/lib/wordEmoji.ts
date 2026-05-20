const EMOJI_MAP: Record<string, string> = {
  ability: '💪', achieve: '🏆', action: '⚡', actually: '💭', afraid: '😨',
  agree: '🤝', allow: '✅', ancient: '🏛️', angry: '😠', answer: '💬',
  appear: '👁️', apply: '📝', argue: '🗣️', arrange: '📋', avoid: '🚫',
  aware: '👁️', beautiful: '🌸', believe: '🙏', blame: '👆', borrow: '🤲',
  brave: '🦁', break: '💥', build: '🏗️', busy: '⏰', careful: '⚠️',
  carry: '📦', cause: '🔗', change: '🔄', character: '⭐', choose: '🎯',
  clear: '✨', collect: '📚', common: '🌐', compare: '⚖️', complete: '✅',
  connect: '🔗', continue: '▶️', control: '🎮', create: '🎨', decide: '🤔',
  depend: '🔗', describe: '📝', develop: '🌱', difficult: '😓', discover: '🔍',
  discuss: '💬', dream: '💭', enjoy: '😊', enough: '✅', escape: '🏃',
  especially: '⭐', example: '📖', exist: '🌍', experience: '🎓', explain: '📢',
  fail: '❌', famous: '⭐', finally: '🏁', focus: '🎯', forget: '🧠',
  freedom: '🕊️', friendly: '😊', future: '🚀', happen: '⚡', happy: '😊',
  honest: '🤝', hope: '🌟', human: '👤', idea: '💡', imagine: '💭',
  important: '⭐', improve: '📈', include: '➕', increase: '📈', instead: '🔄',
  interest: '❤️', knowledge: '📚', language: '🗣️', likely: '🎲', listen: '👂',
  manage: '📊', mention: '💬', mind: '🧠', miss: '💔', necessary: '⚠️',
  notice: '👁️', offer: '🤝', often: '🔄', opinion: '💭', opportunity: '🚪',
  plan: '📋', possible: '✨', practice: '🏋️', prefer: '❤️', prepare: '⚙️',
  prevent: '🛡️', problem: '❓', proud: '🏆', provide: '🎁', reason: '💭',
  recognize: '👁️', remember: '🧠', require: '📋', result: '📊', seem: '👁️',
  serious: '😐', simple: '✨', situation: '🌍', solve: '🧩', spend: '💰',
  strong: '💪', struggle: '💪', suggest: '💡', support: '🤝', surprise: '🎉',
  technology: '💻', trust: '🤝', truth: '⚖️', understand: '💡',
  unfortunately: '😔', value: '💎', various: '🌈', violence: '⚠️',
  vocabulary: '📚', waste: '🗑️', weak: '😔', willing: '✅', wisdom: '🦉',
  worry: '😟', worth: '💎', abandon: '🚶', accept: '✅', accident: '💥',
  accurate: '🎯', adapt: '🦋', admire: '❤️', affect: '🌊', afford: '💰',
  aim: '🎯', amazing: '🌟', ambition: '🚀', approach: '🚶', assist: '🤝',
  assume: '💭', attach: '📎', attempt: '🏋️', attend: '📅', attitude: '😊',
  benefit: '✨', challenge: '💪', communicate: '📡', community: '👥',
  confident: '😎', confuse: '😕', consider: '🤔', convince: '💬',
  cooperate: '🤝', courage: '🦁', curious: '🔍', damage: '💥', danger: '⚠️',
  debate: '🗣️', define: '📖', demand: '📢', deny: '❌', design: '🎨',
  desire: '❤️', determine: '🎯', disaster: '🌪️', discipline: '📏',
  donate: '🎁', doubt: '🤔', earn: '💰', education: '🎓', effective: '✅',
  effort: '💪', emotion: '❤️', encourage: '🌟', environment: '🌿',
  essential: '⭐', establish: '🏛️', evaluate: '📊', evidence: '🔍',
  examine: '🔬', except: '➖', express: '💬', extend: '↔️', factor: '⚙️',
  fair: '⚖️', familiar: '🤝', feature: '⭐', flexible: '🌊', force: '💪',
  formal: '👔', frequent: '🔄', general: '🌐', generate: '⚡',
  gradually: '🐌', grateful: '🙏', guarantee: '📜', guide: '🗺️',
  habit: '🔄', harm: '⚠️', hesitate: '⏸️', highlight: '💡', identify: '🔍',
  ignore: '🙈', impact: '💥', impress: '😮', independent: '🕊️',
  influence: '🌊', inform: '📢', inspire: '✨', intend: '🎯', involve: '🔗',
  issue: '❓', judge: '⚖️', lack: '➖', limit: '🚧', local: '📍',
  maintain: '🔧', major: '⭐', measure: '📏', method: '⚙️', minor: '➖',
  mistake: '❌', modern: '💻', motivate: '🚀', natural: '🌿', negative: '➖',
  obvious: '💡', original: '🎨', overcome: '🏆', participate: '🙋',
  patience: '⏳', pattern: '🔲', perform: '🎭', permit: '✅', physical: '💪',
  positive: '✅', precise: '🎯', pressure: '⚡', process: '⚙️',
  progress: '📈', protect: '🛡️', prove: '📊', purpose: '🎯', react: '⚡',
  reduce: '📉', reflect: '💭', refuse: '❌', relate: '🔗', release: '🕊️',
  rely: '🤝', replace: '🔄', represent: '👥', respond: '💬',
  responsible: '✅', reveal: '🔍', risk: '⚠️', role: '👤', scale: '📏',
  schedule: '📅', secure: '🔒', select: '🎯', significant: '⭐',
  similar: '👯', skill: '🎓', society: '👥', source: '💧', stable: '⚖️',
  strategy: '♟️', stress: '😰', structure: '🏗️', succeed: '🏆',
  sufficient: '✅', surround: '🌀', target: '🎯', threat: '⚠️',
  transfer: '↗️', transform: '🦋', typical: '📦', unique: '✨', unite: '🤝',
  update: '🔄', urgent: '🚨', variety: '🌈', vision: '👁️', volunteer: '🤲',
  vulnerable: '🛡️', warn: '⚠️', wealth: '💰', widespread: '🌐',
  wonder: '🤔', worldwide: '🌍', decade: '📅', emerge: '🌱',
  abstract: '💭', concrete: '🏗️', trigger: '⚡',
};

// Deterministic color based on word for consistent look
const GRADIENTS = [
  'from-violet-400 to-purple-600',
  'from-blue-400 to-cyan-600',
  'from-emerald-400 to-teal-600',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-pink-600',
  'from-sky-400 to-blue-600',
  'from-indigo-400 to-violet-600',
  'from-green-400 to-emerald-600',
];

export function getWordEmoji(word: string): string {
  return EMOJI_MAP[word.toLowerCase()] ?? '📖';
}

export function getWordGradient(word: string): string {
  let hash = 0;
  for (let i = 0; i < word.length; i++) {
    hash = (hash * 31 + word.charCodeAt(i)) % GRADIENTS.length;
  }
  return GRADIENTS[hash];
}
