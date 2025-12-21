// Pathfinder Grapple Decision Tree Data
// Based on the PFSPrep Grapple Flowchart v1.0

export type Role = "grappler" | "grappled" | "outside";

export interface Choice {
  id: string;
  label: string;
  description?: string;
  nextNodeId: string | null; // null means end/result
}

export interface DecisionNode {
  id: string;
  type: "question" | "info" | "result";
  title: string;
  content: string;
  choices?: Choice[];
  tips?: string[];
  mechanics?: string;
}

export interface DecisionTree {
  startNodeId: string;
  nodes: Record<string, DecisionNode>;
}

// ============================================
// GRAPPLER (Attacker) Decision Tree
// ============================================
export const grapplerTree: DecisionTree = {
  startNodeId: "grappler-start",
  nodes: {
    "grappler-start": {
      id: "grappler-start",
      type: "question",
      title: "What's Your Situation?",
      content: "Are you trying to start a new grapple, or are you already grappling someone?",
      choices: [
        {
          id: "initiate",
          label: "Start a New Grapple",
          description: "I want to grab someone",
          nextNodeId: "grappler-initiate-aoo",
        },
        {
          id: "maintain",
          label: "Already Grappling",
          description: "I have someone grappled and it's my turn",
          nextNodeId: "grappler-maintain-choice",
        },
      ],
    },

    // === INITIATING A GRAPPLE ===
    "grappler-initiate-aoo": {
      id: "grappler-initiate-aoo",
      type: "question",
      title: "Attack of Opportunity Check",
      content:
        "Do you have Improved Grapple, Grab ability, or a similar ability that lets you avoid Attacks of Opportunity when grappling?",
      choices: [
        {
          id: "has-feat",
          label: "Yes, I Have It",
          description: "Improved Grapple, Grab, etc.",
          nextNodeId: "grappler-hands-check",
        },
        {
          id: "no-feat",
          label: "No, I Don't",
          nextNodeId: "grappler-provoke-aoo",
        },
      ],
      tips: [
        "Improved Grapple is a feat that requires Improved Unarmed Strike",
        "Many monsters have the Grab ability on their natural attacks",
      ],
    },

    "grappler-provoke-aoo": {
      id: "grappler-provoke-aoo",
      type: "question",
      title: "You Provoke an Attack of Opportunity!",
      content:
        "Your target gets a free attack against you. Did they hit you and deal damage?",
      choices: [
        {
          id: "hit",
          label: "Yes, They Hit Me",
          nextNodeId: "grappler-aoo-penalty",
        },
        {
          id: "miss",
          label: "No, They Missed",
          nextNodeId: "grappler-hands-check",
        },
      ],
      mechanics:
        "Attempting to grapple without Improved Grapple provokes an AoO from your target.",
    },

    "grappler-aoo-penalty": {
      id: "grappler-aoo-penalty",
      type: "info",
      title: "Ouch! AoO Penalty Applied",
      content:
        "The damage you took is applied as a PENALTY to your Grapple CMB check. For example, if you took 8 damage, you have -8 to your grapple attempt.",
      choices: [
        {
          id: "continue",
          label: "Got It, Continue",
          nextNodeId: "grappler-hands-check",
        },
      ],
      tips: [
        "This can make grappling very risky without Improved Grapple!",
        "Consider using Total Defense until you can get the feat",
      ],
    },

    "grappler-hands-check": {
      id: "grappler-hands-check",
      type: "question",
      title: "Free Hands Check",
      content: "Do you have at least two free hands?",
      choices: [
        {
          id: "two-hands",
          label: "Yes, Two Free Hands",
          nextNodeId: "grappler-roll-cmb",
        },
        {
          id: "one-hand",
          label: "No, One or Zero Free",
          nextNodeId: "grappler-hand-penalty",
        },
      ],
      tips: ["Humanoid creatures need two free hands for full effectiveness"],
    },

    "grappler-hand-penalty": {
      id: "grappler-hand-penalty",
      type: "info",
      title: "-4 Penalty to Grapple",
      content:
        "Humanoid creatures without two free hands take a -4 penalty on grapple CMB checks. This includes checks to initiate, maintain, or pin.",
      choices: [
        {
          id: "continue",
          label: "Understood, Continue",
          nextNodeId: "grappler-roll-cmb",
        },
      ],
    },

    "grappler-roll-cmb": {
      id: "grappler-roll-cmb",
      type: "question",
      title: "Roll Your CMB!",
      content:
        "Roll your Combat Maneuver Bonus (CMB) against the target's Combat Maneuver Defense (CMD). Did you succeed?",
      choices: [
        {
          id: "success",
          label: "Yes! I Beat Their CMD",
          nextNodeId: "grappler-success",
        },
        {
          id: "fail",
          label: "No, I Failed",
          nextNodeId: "grappler-fail",
        },
      ],
      mechanics: "CMB = BAB + Str mod + size mod\nCMD = 10 + BAB + Str + Dex + size mod",
      tips: ["Remember any penalties from AoO damage or missing hands!"],
    },

    "grappler-success": {
      id: "grappler-success",
      type: "result",
      title: "🎉 Grapple Successful!",
      content:
        "You've grabbed your target! Both of you now have the GRAPPLED condition. On your next turn, you get a +5 bonus to maintain the grapple.",
      tips: [
        "You're the 'controlling grappler' - you decide what happens",
        "Both of you take -4 to Dex and -2 to attacks (except grapple checks)",
        "Neither of you can make Attacks of Opportunity",
        "Next round, you can: deal damage, pin, move, or tie up (if pinned)",
        "IMPORTANT: You MUST take a maintain action on your turn or the grapple ends!",
        "If you have Constrict, you deal grapple damage now too!",
      ],
      mechanics:
        "GRAPPLED CONDITION:\n• -4 Dexterity\n• -2 on all attacks & combat maneuvers (except to escape/reverse)\n• Cannot make AoOs\n• Cannot move (but can take move-equivalent actions)\n\nGRAB ABILITY: Initiates as free action with +4 bonus.\nCONSTRICT: Deals grapple damage on successful initiate.",
    },

    "grappler-fail": {
      id: "grappler-fail",
      type: "result",
      title: "Grapple Failed",
      content:
        "Your attempt to grab them didn't work. Your Standard Action is used up, but neither of you is grappled.",
      tips: [
        "You can try again next round",
        "Consider flanking for +2, or having allies use Aid Another",
        "Buffs like Bull's Strength can help your CMB",
      ],
    },

    // === MAINTAINING A GRAPPLE ===
    "grappler-maintain-choice": {
      id: "grappler-maintain-choice",
      type: "question",
      title: "What Do You Want to Do?",
      content:
        "You're controlling a grapple. What action would you like to take this turn?",
      choices: [
        {
          id: "release",
          label: "Release the Grapple",
          description: "Let them go (Free Action)",
          nextNodeId: "grappler-release",
        },
        {
          id: "damage",
          label: "Deal Damage",
          description: "Hurt them while maintaining",
          nextNodeId: "grappler-damage",
        },
        {
          id: "pin",
          label: "Pin Them",
          description: "Restrict them further",
          nextNodeId: "grappler-pin",
        },
        {
          id: "move",
          label: "Move with Them",
          description: "Drag them somewhere",
          nextNodeId: "grappler-move",
        },
        {
          id: "tieup",
          label: "Tie Them Up",
          description: "Requires them to be pinned first",
          nextNodeId: "grappler-tieup",
        },
      ],
      tips: [
        "You have a +5 circumstance bonus to maintain",
        "Grab ability gives an additional +4 to maintain checks",
        "All of these except Release require a CMB check vs their CMD",
        "WARNING: If you don't take a maintain action, the grapple automatically ends!",
        "Constrict deals bonus damage on ANY successful maintain check",
      ],
    },

    "grappler-release": {
      id: "grappler-release",
      type: "result",
      title: "Grapple Released",
      content:
        "You release the grapple as a Free Action. Neither of you is grappled anymore. You can still take your Standard and Move actions this turn!",
      tips: [
        "Useful if you need to do something else",
        "The opponent can now move freely on their turn",
      ],
    },

    "grappler-damage": {
      id: "grappler-damage",
      type: "question",
      title: "Deal Damage",
      content:
        "Roll CMB (+5 bonus, +4 more with Grab) vs their CMD to maintain and deal damage. Did you succeed?",
      choices: [
        {
          id: "success",
          label: "Yes, I Succeeded",
          nextNodeId: "grappler-damage-success",
        },
        {
          id: "fail",
          label: "No, I Failed",
          nextNodeId: "grappler-maintain-fail",
        },
      ],
      mechanics:
        "GRAPPLE DAMAGE equals:\n• Unarmed strike (typically 1d3 + Str)\n• Natural attack damage\n• Light or one-handed weapon (if in hand)\n\nDamage can be lethal or nonlethal (your choice).",
      tips: [
        "CMB checks ARE attack rolls - Power Attack works!",
        "Take the penalty on CMB, get bonus damage",
      ],
    },

    "grappler-damage-success": {
      id: "grappler-damage-success",
      type: "result",
      title: "💥 Damage Dealt!",
      content:
        "You deal your grapple damage to the grappled creature. The grapple continues - you're still in control!",
      tips: [
        "You can choose lethal or nonlethal damage",
        "Natural attacks use their normal damage",
        "Light/one-handed weapons work if you have them ready",
        "CONSTRICT: If you have this, you deal grapple damage TWICE!",
      ],
      mechanics:
        "Power Attack example:\nCMB +10, take -2 penalty = CMB +8\nDamage: 1d3+4 Str +4 Power Attack = 1d3+8",
    },

    "grappler-pin": {
      id: "grappler-pin",
      type: "question",
      title: "Attempt to Pin",
      content:
        "Roll CMB (+5 bonus) vs their CMD to pin them. This gives them the PINNED condition. Did you succeed?",
      choices: [
        {
          id: "success",
          label: "Yes, I Pinned Them!",
          nextNodeId: "grappler-pin-success",
        },
        {
          id: "fail",
          label: "No, I Failed",
          nextNodeId: "grappler-maintain-fail",
        },
      ],
      mechanics:
        "When you pin:\n• They get the PINNED condition (worse than grappled)\n• You keep the GRAPPLED condition\n• You lose your Dex bonus to AC",
    },

    "grappler-pin-success": {
      id: "grappler-pin-success",
      type: "result",
      title: "📌 Target Pinned!",
      content:
        "They're pinned! They're severely restricted now. Next round you can TIE THEM UP if you want to really lock them down.",
      tips: [
        "Pinned creatures can't move and are denied Dex to AC",
        "They can only take verbal/mental actions",
        "They can't cast spells with somatic/material components",
        "You lose your Dex bonus to AC while pinning",
      ],
      mechanics:
        "PINNED CONDITION:\n• Cannot move\n• Denied Dex bonus to AC (but not flat-footed)\n• Can only take verbal/mental actions\n• Can attempt to escape with CMB or Escape Artist",
    },

    "grappler-move": {
      id: "grappler-move",
      type: "question",
      title: "Move with Grappled Creature",
      content:
        "Roll CMB (+5 bonus) vs their CMD to move both of you up to half your speed. Did you succeed?",
      choices: [
        {
          id: "success",
          label: "Yes, I Can Move!",
          nextNodeId: "grappler-move-success",
        },
        {
          id: "fail",
          label: "No, I Failed",
          nextNodeId: "grappler-maintain-fail",
        },
      ],
    },

    "grappler-move-success": {
      id: "grappler-move-success",
      type: "question",
      title: "Where Are You Placing Them?",
      content:
        "You move up to half your speed with them. At the end, you place them in any adjacent square. Is it a hazardous location?",
      choices: [
        {
          id: "safe",
          label: "Normal/Safe Square",
          nextNodeId: "grappler-move-done",
        },
        {
          id: "hazard",
          label: "Hazardous Location",
          description: "Pit, fire, lava, etc.",
          nextNodeId: "grappler-move-hazard",
        },
      ],
    },

    "grappler-move-done": {
      id: "grappler-move-done",
      type: "result",
      title: "✅ Movement Complete",
      content:
        "You've moved up to half your speed with your grappled opponent. They're now in an adjacent square of your choice. The grapple continues!",
    },

    "grappler-move-hazard": {
      id: "grappler-move-hazard",
      type: "result",
      title: "⚠️ Hazardous Placement",
      content:
        "You can place them in a hazardous location, BUT they get a FREE attempt to break the grapple with a +4 bonus! If they succeed, they land in a safe adjacent square instead.",
      tips: [
        "Great for pushing enemies into pits or environmental hazards",
        "Be aware they might escape!",
      ],
    },

    "grappler-maintain-fail": {
      id: "grappler-maintain-fail",
      type: "result",
      title: "Maintain Check Failed",
      content:
        "You failed the check, but you still control the grapple! The specific action you tried (damage/pin/move) didn't work, but you're both still grappled.",
      tips: [
        "You don't lose the grapple on a failed maintain",
        "You just don't get the extra effect this round",
        "Try again next turn!",
      ],
    },

    "grappler-tieup": {
      id: "grappler-tieup",
      type: "question",
      title: "Tie Up Opponent",
      content:
        "Is your opponent currently Pinned, Restrained, or Unconscious?",
      choices: [
        {
          id: "pinned",
          label: "Yes, They're Pinned/Restrained/Unconscious",
          nextNodeId: "grappler-tieup-rope-check",
        },
        {
          id: "not-pinned",
          label: "No, Just Grappled",
          nextNodeId: "grappler-tieup-not-pinned",
        },
      ],
    },

    "grappler-tieup-not-pinned": {
      id: "grappler-tieup-not-pinned",
      type: "question",
      title: "Tying Up a Non-Pinned Target",
      content:
        "You CAN attempt to tie up a grappled (not pinned) creature, but you take a -10 penalty. Do you want to try anyway?",
      choices: [
        {
          id: "try-anyway",
          label: "Yes, Try with -10 Penalty",
          nextNodeId: "grappler-tieup-rope-check",
        },
        {
          id: "pin-first",
          label: "No, I'll Pin Them First",
          nextNodeId: "grappler-pin",
        },
      ],
      tips: [
        "Pinning first removes the -10 penalty",
        "But if you're confident in your CMB, you can skip straight to tying",
      ],
    },

    "grappler-tieup-rope-check": {
      id: "grappler-tieup-rope-check",
      type: "question",
      title: "Do You Have Rope Ready?",
      content:
        "You need rope (or similar binding) IN YOUR HAND to tie someone up. Is it already in your hand?",
      choices: [
        {
          id: "rope-ready",
          label: "Yes, Rope Is In Hand",
          nextNodeId: "grappler-tieup-attempt",
        },
        {
          id: "need-to-draw",
          label: "No, I Need to Draw It",
          nextNodeId: "grappler-tieup-draw-rope",
        },
      ],
    },

    "grappler-tieup-draw-rope": {
      id: "grappler-tieup-draw-rope",
      type: "info",
      title: "Draw the Rope First",
      content:
        "Drawing rope requires a Move Action. Once you have it in hand, you'll only have one free hand, which means -4 penalty on the grapple check!",
      choices: [
        {
          id: "continue",
          label: "Got It, Continue to Tie Up",
          nextNodeId: "grappler-tieup-attempt",
        },
      ],
      mechanics:
        "Move Action: Draw rope\nStandard Action: Attempt Tie Up\n\nPenalty: -4 for one-handed grapple",
    },

    "grappler-tieup-attempt": {
      id: "grappler-tieup-attempt",
      type: "question",
      title: "Tie Them Up!",
      content:
        "Roll your CMB vs their CMD. Remember your penalties: -4 if one-handed, -10 if target isn't pinned. Did you succeed?",
      choices: [
        {
          id: "success",
          label: "Yes, I Succeeded!",
          nextNodeId: "grappler-tieup-success",
        },
        {
          id: "fail",
          label: "No, I Failed",
          nextNodeId: "grappler-tieup-fail",
        },
      ],
      mechanics:
        "CMB vs CMD\nPossible penalties:\n• -4 for one hand occupied (holding rope)\n• -10 if target is only grappled (not pinned)",
    },

    "grappler-tieup-success": {
      id: "grappler-tieup-success",
      type: "result",
      title: "🪢 Target Tied Up!",
      content:
        "They're bound! The escape DC is as if you rolled a 20 on your CMB (20 + your CMB). You can release the grapple now - they're not going anywhere!",
      tips: [
        "Escape DC: 20 + your CMB (not your roll, your total CMB)",
        "Or they can try to break the rope (usually DC 23)",
        "Tied Up = Pinned condition, NOT Helpless (no Coup de Grace!)",
        "Tied up creatures have Dexterity 0 (-5 modifier)",
        "You can safely release the grapple - they stay tied",
      ],
      mechanics:
        "Escape DC: 20 + your CMB\nBreak rope: DC 23 (Strength check)\n\nTied Up gives Pinned condition + Dex 0\nNOT Helpless - no Coup de Grace unless they're also unconscious",
    },

    "grappler-tieup-fail": {
      id: "grappler-tieup-fail",
      type: "result",
      title: "Tie Up Failed",
      content:
        "You couldn't secure the bindings. The grapple continues though - they're still pinned/grappled. Try again next round!",
      tips: [
        "You don't lose the grapple on a failed tie-up attempt",
        "Consider having an ally Aid Another next round",
      ],
    },
  },
};

// ============================================
// GRAPPLED CREATURE (Defender) Decision Tree
// ============================================
export const grappledTree: DecisionTree = {
  startNodeId: "grappled-start",
  nodes: {
    "grappled-start": {
      id: "grappled-start",
      type: "question",
      title: "What's Your Condition?",
      content: "Are you Grappled or Pinned?",
      choices: [
        {
          id: "grappled",
          label: "Grappled",
          description: "Being held, but can still act somewhat",
          nextNodeId: "grappled-actions",
        },
        {
          id: "pinned",
          label: "Pinned",
          description: "Completely restrained, very limited options",
          nextNodeId: "pinned-actions",
        },
      ],
    },

    "grappled-actions": {
      id: "grappled-actions",
      type: "question",
      title: "You're Grappled! What Now?",
      content: "What are you trying to do on your turn?",
      choices: [
        {
          id: "escape",
          label: "Escape the Grapple",
          description: "Break free completely",
          nextNodeId: "grappled-escape",
        },
        {
          id: "reverse",
          label: "Reverse the Grapple",
          description: "Become the controller",
          nextNodeId: "grappled-reverse",
        },
        {
          id: "attack",
          label: "Attack the Grappler",
          description: "Fight back!",
          nextNodeId: "grappled-attack",
        },
        {
          id: "spell",
          label: "Cast a Spell",
          description: "Use magic",
          nextNodeId: "grappled-spell",
        },
      ],
      tips: [
        "Remember: You have -4 Dex and -2 to attacks while grappled",
        "You cannot make Attacks of Opportunity",
        "You cannot move from your square",
        "You CAN take any action that doesn't require two hands",
      ],
    },

    "pinned-actions": {
      id: "pinned-actions",
      type: "question",
      title: "You're Pinned! Very Limited Options",
      content: "Pinned is worse than grappled. What do you want to try?",
      choices: [
        {
          id: "escape",
          label: "Try to Escape",
          description: "CMB or Escape Artist vs their CMD",
          nextNodeId: "grappled-escape",
        },
        {
          id: "spell",
          label: "Cast a Spell",
          description: "Very restricted!",
          nextNodeId: "pinned-spell",
        },
        {
          id: "verbal",
          label: "Verbal/Mental Action",
          description: "Talk, use purely mental abilities",
          nextNodeId: "pinned-verbal",
        },
      ],
      tips: [
        "You CANNOT take physical actions except trying to escape",
        "You CANNOT cast spells with somatic components",
        "You ARE denied your Dex bonus to AC",
        "You can still speak and use purely mental abilities",
      ],
      mechanics:
        "PINNED CONDITION:\n• No physical actions except escape attempts\n• No somatic component spells\n• Denied Dex to AC (but not flat-footed)\n• Verbal/mental actions still work",
    },

    "pinned-spell": {
      id: "pinned-spell",
      type: "question",
      title: "Casting While Pinned - Very Restricted!",
      content: "Does your spell have somatic (S) components?",
      choices: [
        {
          id: "has-somatic",
          label: "Yes, Has Somatic Components",
          nextNodeId: "pinned-spell-denied",
        },
        {
          id: "no-somatic",
          label: "No Somatic Components",
          nextNodeId: "pinned-spell-material-check",
        },
      ],
      tips: [
        "Most spells have somatic components!",
        "Still spell metamagic can help here",
      ],
    },

    "pinned-spell-denied": {
      id: "pinned-spell-denied",
      type: "result",
      title: "❌ Cannot Cast - Somatic Components!",
      content:
        "You cannot cast spells with somatic components while pinned. You simply cannot perform the hand movements required.",
      tips: [
        "Still Spell metamagic removes somatic components",
        "Try to escape first, then cast",
        "Or use a spell without somatic components",
      ],
    },

    "pinned-spell-material-check": {
      id: "pinned-spell-material-check",
      type: "question",
      title: "Material/Focus Components?",
      content:
        "Does your spell have material (M) or focus (F) components? If so, you MUST already have them in hand - you can't draw them while pinned!",
      choices: [
        {
          id: "components-ready",
          label: "No M/F, or Already In Hand",
          nextNodeId: "pinned-spell-concentration",
        },
        {
          id: "need-components",
          label: "Need to Draw Components",
          nextNodeId: "pinned-spell-no-components",
        },
      ],
      tips: [
        "Drawing components is a physical action - not allowed while pinned",
        "You had to have drawn them BEFORE being pinned",
      ],
    },

    "pinned-spell-no-components": {
      id: "pinned-spell-no-components",
      type: "result",
      title: "❌ Cannot Cast - Components Not Ready!",
      content:
        "You can't draw material or focus components while pinned. You needed to have them in hand before you were pinned.",
      tips: [
        "Eschew Materials feat eliminates cheap material components",
        "Some spells have no material components",
        "Try to escape first!",
      ],
    },

    "pinned-spell-concentration": {
      id: "pinned-spell-concentration",
      type: "question",
      title: "Concentration Check",
      content:
        "You can attempt to cast! Make a Concentration check: DC 10 + Grappler's CMB + Spell Level. Did you pass?",
      choices: [
        {
          id: "success",
          label: "Yes, I Made the Check!",
          nextNodeId: "grappled-spell-success",
        },
        {
          id: "fail",
          label: "No, I Failed",
          nextNodeId: "grappled-spell-fail",
        },
      ],
      mechanics:
        "Concentration DC: 10 + Grappler's CMB + Spell Level\n\nSame as when grappled, but with the additional\nrestrictions on somatic/material components.",
    },

    "pinned-verbal": {
      id: "pinned-verbal",
      type: "result",
      title: "✅ Verbal/Mental Actions Work!",
      content:
        "You can speak, use purely mental abilities, and take other verbal/mental actions normally while pinned.",
      tips: [
        "Call for help!",
        "Use command word items (if not requiring somatic activation)",
        "Telepathy and similar mental abilities work",
        "Bardic performance (verbal only) may work - check with GM",
      ],
    },

    "grappled-escape": {
      id: "grappled-escape",
      type: "question",
      title: "Escape Attempt",
      content:
        "You can use CMB OR Escape Artist to break free. Roll against the grappler's CMD. Did you succeed?",
      choices: [
        {
          id: "success",
          label: "Yes! I'm Free!",
          nextNodeId: "grappled-escape-success",
        },
        {
          id: "fail",
          label: "No, I Failed",
          nextNodeId: "grappled-escape-fail",
        },
      ],
      mechanics:
        "Your CMB vs their CMD\nOR\nEscape Artist vs their CMD\n\nThis is a Standard Action.",
      tips: [
        "Escape Artist is often better for Dex-based characters",
        "You can use whichever is higher!",
        "Allies can Aid Another to give you +2",
      ],
    },

    "grappled-escape-success": {
      id: "grappled-escape-success",
      type: "result",
      title: "🏃 You Escaped!",
      content:
        "You break free from the grapple! Neither of you is grappled anymore. You can move on your next turn!",
      tips: [
        "Your Standard Action is used, but you can still move this turn",
        "Consider moving away to prevent them from re-grappling",
        "5-foot step doesn't provoke AoOs!",
      ],
    },

    "grappled-escape-fail": {
      id: "grappled-escape-fail",
      type: "result",
      title: "Still Grappled",
      content:
        "You couldn't break free. You're still grappled and your Standard Action is used up.",
      tips: [
        "You can try again next round",
        "Consider having allies use Aid Another to help",
        "Grease spell can help (+10 to Escape Artist!)",
      ],
    },

    "grappled-reverse": {
      id: "grappled-reverse",
      type: "question",
      title: "Reverse the Grapple",
      content:
        "Roll your CMB vs their CMD. If you succeed, YOU become the controlling grappler! Did you succeed?",
      choices: [
        {
          id: "success",
          label: "Yes! I'm in Control Now!",
          nextNodeId: "grappled-reverse-success",
        },
        {
          id: "fail",
          label: "No, I Failed",
          nextNodeId: "grappled-reverse-fail",
        },
      ],
      mechanics:
        "Your CMB vs their CMD\n\nThis is a Standard Action.\nYou do NOT get the +5 bonus they had.",
    },

    "grappled-reverse-success": {
      id: "grappled-reverse-success",
      type: "result",
      title: "🔄 Grapple Reversed!",
      content:
        "You're now the controlling grappler! Both of you are still grappled, but YOU get the +5 bonus to maintain next round. The tables have turned!",
      tips: [
        "Next round, you can deal damage, pin, or move them",
        "They'll be trying to escape or reverse on their turn",
        "You've got the advantage now!",
        "CONSTRICT: If you have this ability, you deal grapple damage now!",
      ],
      mechanics:
        "Note: Constrict triggers on successful grapple CMB checks.\nThis includes reversing a grapple!\n(Escape Artist does NOT trigger Constrict)",
    },

    "grappled-reverse-fail": {
      id: "grappled-reverse-fail",
      type: "result",
      title: "Reverse Failed",
      content:
        "You couldn't take control. You're still grappled and they're still in charge.",
    },

    "grappled-attack": {
      id: "grappled-attack",
      type: "question",
      title: "Attack While Grappled",
      content: "What kind of weapon are you using?",
      choices: [
        {
          id: "light",
          label: "Light or One-Handed Weapon",
          description: "Dagger, short sword, etc.",
          nextNodeId: "grappled-attack-allowed",
        },
        {
          id: "natural",
          label: "Natural Attacks",
          description: "Claws, bite, etc.",
          nextNodeId: "grappled-attack-allowed",
        },
        {
          id: "unarmed",
          label: "Unarmed Strike",
          nextNodeId: "grappled-attack-allowed",
        },
        {
          id: "twohanded",
          label: "Two-Handed Weapon",
          description: "Greatsword, longbow, etc.",
          nextNodeId: "grappled-attack-denied",
        },
      ],
    },

    "grappled-attack-allowed": {
      id: "grappled-attack-allowed",
      type: "result",
      title: "⚔️ You Can Attack!",
      content:
        "You can attack the grappler (or anyone else in reach) with your light/one-handed weapon, natural attacks, or unarmed strikes. You can even take a Full Attack action!",
      mechanics:
        "Remember your penalties:\n• -4 to Dexterity\n• -2 to attack rolls\n\nYou CAN take a full attack action if you have multiple attacks.",
      tips: [
        "This doesn't require any checks - just attack!",
        "You can target anyone in your reach, not just the grappler",
        "Full attacks are allowed!",
      ],
    },

    "grappled-attack-denied": {
      id: "grappled-attack-denied",
      type: "result",
      title: "❌ Can't Use That Weapon",
      content:
        "You cannot use two-handed weapons while grappled. You need a light or one-handed weapon, natural attack, or unarmed strike.",
      tips: [
        "Drop the two-handed weapon and punch them!",
        "Or try to escape instead",
        "Always keep a dagger handy for situations like this",
      ],
    },

    "grappled-spell": {
      id: "grappled-spell",
      type: "question",
      title: "Casting While Grappled",
      content: "Does your spell have somatic (S), material (M), or focus (F) components?",
      choices: [
        {
          id: "no-components",
          label: "No S, M, or F Components",
          description: "Verbal only or no components",
          nextNodeId: "grappled-spell-easy",
        },
        {
          id: "has-components",
          label: "Yes, Has S, M, or F Components",
          nextNodeId: "grappled-spell-hard",
        },
      ],
      tips: [
        "Good news: S, M, and F components all use the SAME free hand",
        "You only need one hand free for all of them",
      ],
    },

    "grappled-spell-easy": {
      id: "grappled-spell-easy",
      type: "result",
      title: "🪄 Cast Your Spell!",
      content:
        "Spells without somatic/material/focus components can be cast while grappled. You still need to make a concentration check!",
      mechanics:
        "Concentration DC: 10 + Grappler's CMB + Spell Level\n\nIf you fail, the spell is lost.",
      tips: [
        "This is the same DC as spells with components",
        "The only advantage is not needing a free hand",
      ],
    },

    "grappled-spell-hard": {
      id: "grappled-spell-hard",
      type: "question",
      title: "Concentration Check Required",
      content:
        "You need a free hand AND must pass a Concentration check (DC 10 + Grappler's CMB + Spell Level). Did you pass?",
      choices: [
        {
          id: "success",
          label: "Yes, I Made the Check!",
          nextNodeId: "grappled-spell-success",
        },
        {
          id: "fail",
          label: "No, I Failed",
          nextNodeId: "grappled-spell-fail",
        },
      ],
      mechanics:
        "Concentration DC: 10 + Grappler's CMB + Spell Level\n\nExample: Grappler CMB 12, casting Fireball (3rd level)\nDC = 10 + 12 + 3 = 25",
      tips: [
        "S, M, and F components all use the same hand",
        "As long as you have one hand free, you can handle all of them",
      ],
    },

    "grappled-spell-success": {
      id: "grappled-spell-success",
      type: "result",
      title: "✨ Spell Cast Successfully!",
      content:
        "You manage to cast the spell despite being grappled! It goes off as normal.",
      tips: [
        "Touch spells can target the grappler easily",
        "Be careful with AoE spells - you might hit yourself!",
        "Dimension Door is great for escaping",
      ],
    },

    "grappled-spell-fail": {
      id: "grappled-spell-fail",
      type: "result",
      title: "💫 Spell Lost!",
      content:
        "You failed the concentration check. The spell is lost and the spell slot is used up.",
      tips: [
        "Try a lower-level spell with a lower DC",
        "Or try escaping the grapple first",
        "Combat Casting feat helps (+4 to concentration)",
      ],
    },
  },
};

// ============================================
// OUTSIDE CREATURE Decision Tree
// ============================================
export const outsideTree: DecisionTree = {
  startNodeId: "outside-start",
  nodes: {
    "outside-start": {
      id: "outside-start",
      type: "question",
      title: "Helping from Outside",
      content:
        "You're not in the grapple, but you want to affect it. What do you want to do?",
      choices: [
        {
          id: "aid-attacker",
          label: "Help the Grappler",
          description: "Aid your ally who's grappling",
          nextNodeId: "outside-aid-grappler",
        },
        {
          id: "aid-defender",
          label: "Help the Grappled Creature",
          description: "Aid someone trying to escape",
          nextNodeId: "outside-aid-defender",
        },
        {
          id: "attack",
          label: "Attack Someone in the Grapple",
          description: "Hit them while they're busy",
          nextNodeId: "outside-attack",
        },
        {
          id: "join",
          label: "Join the Grapple",
          description: "Dogpile!",
          nextNodeId: "outside-join",
        },
      ],
    },

    "outside-aid-grappler": {
      id: "outside-aid-grappler",
      type: "result",
      title: "🤝 Aid the Grappler",
      content:
        "Use the Aid Another action to give the grappler a +2 bonus on their CMB check. Roll attack vs AC 10 to succeed.",
      mechanics:
        "Aid Another:\n• Standard Action\n• Roll attack vs AC 10\n• Success = +2 to ally's next CMB check\n\nMultiple creatures can aid - bonuses stack!",
      tips: [
        "Each helper adds +2",
        "Great for dogpiling tough enemies",
        "Only works on their next check",
      ],
    },

    "outside-aid-defender": {
      id: "outside-aid-defender",
      type: "result",
      title: "🤝 Aid the Defender",
      content:
        "Use Aid Another to give the grappled creature a +2 bonus to escape. Roll attack vs AC 10.",
      mechanics:
        "Aid Another:\n• Standard Action\n• Roll attack vs AC 10\n• Success = +2 to escape attempt\n\nMultiple creatures can aid - bonuses stack!",
      tips: [
        "Help your friend break free!",
        "The bonus applies to their CMB or Escape Artist",
        "Stack those +2s!",
      ],
    },

    "outside-attack": {
      id: "outside-attack",
      type: "question",
      title: "Attack into the Grapple",
      content: "Who are you trying to hit?",
      choices: [
        {
          id: "grappler",
          label: "The Grappler (Controller)",
          nextNodeId: "outside-attack-grappler",
        },
        {
          id: "defender",
          label: "The Grappled Creature",
          nextNodeId: "outside-attack-defender",
        },
      ],
    },

    "outside-attack-grappler": {
      id: "outside-attack-grappler",
      type: "result",
      title: "⚔️ Attack the Grappler",
      content:
        "You can attack the grappler normally. They don't get any special protection from being in a grapple, and they might lose their Dex to AC if they're pinning someone!",
      tips: [
        "If they're pinning, they lose Dex to AC",
        "Grappled creatures have -4 Dex already",
        "Flanking still works as normal",
      ],
    },

    "outside-attack-defender": {
      id: "outside-attack-defender",
      type: "result",
      title: "⚔️ Attack the Grappled Creature",
      content:
        "You can attack the grappled creature. They have -4 to Dexterity from being grappled, making them easier to hit!",
      tips: [
        "Their AC is lower due to -4 Dex",
        "If they're pinned, they're denied Dex entirely",
        "Sneak Attack works on pinned targets",
      ],
    },

    "outside-join": {
      id: "outside-join",
      type: "question",
      title: "Join the Grapple",
      content:
        "You can attempt to grapple one of the creatures already in the grapple. Who are you grabbing?",
      choices: [
        {
          id: "grappler",
          label: "Grapple the Grappler",
          nextNodeId: "outside-join-result",
        },
        {
          id: "defender",
          label: "Grapple the Defender",
          nextNodeId: "outside-join-result",
        },
      ],
    },

    "outside-join-result": {
      id: "outside-join-result",
      type: "result",
      title: "🤼 Joining the Grapple",
      content:
        "Make a grapple attempt against your target. If you succeed, you're now grappling them too! This can get complicated with multiple grapplers.",
      mechanics:
        "Standard grapple rules apply:\n• Provokes AoO without Improved Grapple\n• CMB vs CMD\n• Both you and target become grappled on success",
      tips: [
        "Multiple grapplers make it very hard to escape",
        "You can coordinate with allies",
        "The original grappler might still have their +5 bonus",
      ],
    },
  },
};

// Reference info for quick lookups
export const conditionReference = {
  grappled: {
    name: "Grappled",
    effects: [
      "-4 penalty to Dexterity",
      "-2 penalty on all attack and combat maneuver checks (except to escape/reverse)",
      "Cannot make Attacks of Opportunity",
      "Cannot move (but can take move-equivalent actions)",
      "Cannot use Stealth to hide from the creature grappling you",
      "Cannot take actions requiring two hands",
      "CAN make full attacks with light/one-handed weapons (at -2)",
      "CAN cast spells (Concentration DC: 10 + CMB + spell level)",
    ],
  },
  pinned: {
    name: "Pinned",
    effects: [
      "Cannot move",
      "Denied Dexterity bonus to AC (but not flat-footed)",
      "Can only take verbal and mental actions",
      "Cannot cast spells with somatic components AT ALL",
      "Material/Focus components must already be in hand",
      "Concentration DC: 10 + grappler's CMB + spell level",
      "Can always attempt to escape (CMB or Escape Artist)",
    ],
  },
  tiedUp: {
    name: "Tied Up",
    effects: [
      "Has the Pinned condition (NOT Helpless!)",
      "Treated as having Dexterity 0 (-5 modifier)",
      "Escape DC: 20 + binder's CMB (Escape Artist)",
      "Or break bindings (rope DC 23, Strength check)",
      "No Coup de Grace unless also unconscious",
    ],
  },
};

// Special abilities reference
export const specialAbilities = {
  grab: {
    name: "Grab",
    description: "Many monsters have this ability on their natural attacks.",
    effects: [
      "Initiate grapple as FREE ACTION after hitting with associated attack",
      "+4 bonus to CMB checks to initiate grapple",
      "+4 bonus to CMB checks to maintain grapple",
      "Does NOT help with resisting/escaping grapples",
      "Can choose 'Hold' instead: -20 penalty, but you don't get grappled condition",
    ],
  },
  constrict: {
    name: "Constrict",
    description: "Automatically deal damage when grappling.",
    effects: [
      "Deal grapple damage when you successfully INITIATE a grapple",
      "Deal grapple damage on ANY successful maintain check (in addition to chosen action)",
      "If you choose 'Damage' action, you deal damage TWICE",
      "Triggers on successful CMB checks to reverse a grapple",
      "Does NOT trigger when using Escape Artist",
    ],
  },
  improvedGrapple: {
    name: "Improved Grapple",
    description: "Feat that makes grappling safer and more effective.",
    effects: [
      "No Attack of Opportunity when initiating grapple",
      "+2 bonus on CMB checks to grapple",
      "+2 bonus to CMD against grapple attempts",
      "Requires: Improved Unarmed Strike, Dex 13",
    ],
  },
  greaterGrapple: {
    name: "Greater Grapple",
    description: "Advanced grappling feat for dedicated grapplers.",
    effects: [
      "Maintain grapple as a MOVE action (not standard)",
      "Allows two maintain checks per round!",
      "+2 bonus on CMB checks to grapple (stacks with Improved)",
      "Requires: Improved Grapple, BAB +6",
    ],
  },
};
