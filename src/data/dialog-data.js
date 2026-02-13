// ============================================
// Dialog Data - Dialog Tree Definitions
// For use with the DialogSystem instead of yarn stories
// ============================================

export const DIALOG_DATA = {
  // Town Square Quest Dialog
  town_square_quest: {
    nodes: {
      greeting: {
        character: 'merchant',
        text: 'Ah, a visitor! Welcome to our humble town square. What brings you here, traveler?',
        choices: [
          { text: 'I\'m looking for work.', nextNode: 'work_offer' },
          { text: 'Just passing through.', nextNode: 'farewell' },
          { text: 'Tell me about this town.', nextNode: 'town_info' }
        ],
        isEntry: true
      },
      work_offer: {
        character: 'merchant',
        text: 'Work, you say? Well, there might be some opportunities. The blacksmith needs an apprentice, and the tavern always needs help. Or perhaps you\'d be interested in some... special work?',
        choices: [
          { text: 'Special work?', nextNode: 'secret_mission' },
          { text: 'I\'ll check with the blacksmith.', nextNode: 'blacksmith_referral' },
          { text: 'Maybe another time.', nextNode: 'farewell' }
        ]
      },
      secret_mission: {
        character: 'merchant',
        text: 'Shhh! Not so loud. There\'s been some trouble with bandits in the forest. The lord is offering a reward for anyone who can clear them out. Interested?',
        choices: [
          { text: 'I\'m interested.', nextNode: 'mission_accepted' },
          { text: 'That sounds dangerous.', nextNode: 'mission_declined' }
        ],
        consequences: [
          { type: 'flag', flag: 'bandit_quest_offered', value: true }
        ]
      },
      mission_accepted: {
        character: 'merchant',
        text: 'Excellent! Head to the forest entrance and look for signs of the bandits. Return when you\'ve dealt with them.',
        consequences: [
          { type: 'flag', flag: 'bandit_quest_active', value: true }
        ],
        nextNode: 'farewell'
      },
      mission_declined: {
        character: 'merchant',
        text: 'I understand. Not everyone has the stomach for adventure. Safe travels, friend.',
        nextNode: 'farewell'
      },
      blacksmith_referral: {
        character: 'merchant',
        text: 'Good choice! The blacksmith is just over there. Tell him I sent you.',
        nextNode: 'farewell'
      },
      town_info: {
        character: 'merchant',
        text: 'This is the town of [Town Name], a peaceful settlement in the heart of the kingdom. We have a castle, a church, and all the amenities a traveler could want.',
        choices: [
          { text: 'Sounds lovely.', nextNode: 'farewell' },
          { text: 'I\'m looking for work.', nextNode: 'work_offer' }
        ]
      },
      farewell: {
        character: 'merchant',
        text: 'Safe travels, friend. May your journey be prosperous!',
        nextNode: null
      }
    }
  },

  // Castle Gate Delivery Dialog
  castle_gate_delivery: {
    nodes: {
      guard_greeting: {
        character: 'guard',
        text: 'Halt! Who goes there? State your business at the castle gate.',
        choices: [
          { text: 'I have a delivery for the lord.', nextNode: 'delivery_check' },
          { text: 'Just visiting.', nextNode: 'visitor_denied' },
          { text: 'Official business.', nextNode: 'official_business' }
        ],
        isEntry: true
      },
      delivery_check: {
        character: 'guard',
        text: 'A delivery? Let me see your papers. Hmm... this looks legitimate. You may proceed to the main hall.',
        choices: [
          { text: 'Thank you, sir.', nextNode: 'granted_entry' },
          { text: 'Is there a reward for this delivery?', nextNode: 'reward_inquiry' }
        ]
      },
      granted_entry: {
        character: 'guard',
        text: 'Present your delivery to the steward in the main hall. Good day.',
        consequences: [
          { type: 'flag', flag: 'castle_access_granted', value: true }
        ],
        nextNode: null
      },
      reward_inquiry: {
        character: 'guard',
        text: 'The lord is generous with those who serve him well. You\'ll be compensated for your service.',
        nextNode: 'granted_entry'
      },
      visitor_denied: {
        character: 'guard',
        text: 'The castle is not open to casual visitors today. Perhaps try the tavern instead.',
        nextNode: null
      },
      official_business: {
        character: 'guard',
        text: 'Official business? Let me check the records... I don\'t see your name on the list. You\'ll need to speak with the steward first.',
        nextNode: null
      }
    }
  },

  // Forest Encounter Dialog
  forest_encounter: {
    nodes: {
      bandit_approach: {
        character: 'bandit',
        text: 'Well, well, what do we have here? A lone traveler wandering through our forest. This is our territory now.',
        choices: [
          { text: 'I\'m just passing through.', nextNode: 'warning' },
          { text: 'I\'ve come to deal with bandits like you.', nextNode: 'confrontation' },
          { text: 'I have business in these woods.', nextNode: 'business_inquiry' }
        ],
        isEntry: true
      },
      warning: {
        character: 'bandit',
        text: 'Passing through, eh? That\'ll cost you. Hand over your valuables and maybe we\'ll let you live.',
        choices: [
          { text: 'Never!', nextNode: 'fight_response' },
          { text: 'Take what you want.', nextNode: 'surrender' },
          { text: 'I\'m here on behalf of the town.', nextNode: 'town_business' }
        ]
      },
      confrontation: {
        character: 'bandit',
        text: 'Big words for someone so outnumbered. You think you can take us all?',
        choices: [
          { text: 'Yes, I do.', nextNode: 'fight_response' },
          { text: 'Maybe we can work something out.', nextNode: 'negotiation' }
        ]
      },
      fight_response: {
        character: 'bandit',
        text: 'Then let\'s see what you\'re made of!',
        consequences: [
          { type: 'trigger_event', event: 'TRIGGER_COMBAT', payload: { enemyId: 'bandit_group' } }
        ],
        nextNode: null
      },
      surrender: {
        character: 'bandit',
        text: 'Smart choice. Now get out of our forest before we change our minds.',
        consequences: [
          { type: 'stat_change', stat: 'wealth', delta: -10 }
        ],
        nextNode: null
      },
      town_business: {
        character: 'bandit',
        text: 'The town sent you? Hah! They\'re too cowardly to deal with us themselves. But if you\'re serious about clearing us out, prove it!',
        nextNode: 'fight_response'
      },
      business_inquiry: {
        character: 'bandit',
        text: 'Business? What kind of business brings someone like you into bandit territory?',
        choices: [
          { text: 'Hunting.', nextNode: 'hunting_response' },
          { text: 'I\'m lost.', nextNode: 'lost_response' },
          { text: 'Official business.', nextNode: 'official_response' }
        ]
      },
      hunting_response: {
        character: 'bandit',
        text: 'Hunting? The game here belongs to us now. But maybe we can come to an arrangement...',
        choices: [
          { text: 'What arrangement?', nextNode: 'bribe_attempt' },
          { text: 'I\'ll hunt elsewhere.', nextNode: 'leave_peacefully' }
        ]
      },
      bribe_attempt: {
        character: 'bandit',
        text: 'Pay us a small tribute and you can hunt all you want. Say... 20 gold pieces?',
        choices: [
          { text: 'Deal.', nextNode: 'bribe_accepted' },
          { text: 'No deal.', nextNode: 'fight_response' }
        ]
      },
      bribe_accepted: {
        character: 'bandit',
        text: 'Pleasure doing business with you. Enjoy your hunt.',
        consequences: [
          { type: 'stat_change', stat: 'wealth', delta: -20 }
        ],
        nextNode: null
      },
      leave_peacefully: {
        character: 'bandit',
        text: 'Wise choice. Now get moving.',
        nextNode: null
      },
      lost_response: {
        character: 'bandit',
        text: 'Lost? How unfortunate. For a small fee, we might point you in the right direction.',
        choices: [
          { text: 'I\'ll find my own way.', nextNode: 'fight_response' },
          { text: 'How much?', nextNode: 'lost_fee' }
        ]
      },
      lost_fee: {
        character: 'bandit',
        text: 'Just 5 gold pieces for directions out of the forest. Fair price for your life.',
        choices: [
          { text: 'Here\'s the money.', nextNode: 'fee_paid' },
          { text: 'Forget it.', nextNode: 'fight_response' }
        ]
      },
      fee_paid: {
        character: 'bandit',
        text: 'Head due north and you\'ll find the road. Don\'t come back.',
        consequences: [
          { type: 'stat_change', stat: 'wealth', delta: -5 }
        ],
        nextNode: null
      },
      official_response: {
        character: 'bandit',
        text: 'Official business? You don\'t look official. Prove it or face the consequences.',
        choices: [
          { text: 'I have papers.', nextNode: 'papers_check' },
          { text: 'I don\'t need to prove anything.', nextNode: 'fight_response' }
        ]
      },
      papers_check: {
        character: 'bandit',
        text: 'Papers, eh? Let me see... these look fake to me. Time to teach you a lesson!',
        nextNode: 'fight_response'
      },
      negotiation: {
        character: 'bandit',
        text: 'You want to negotiate? What do you have to offer?',
        choices: [
          { text: 'Money.', nextNode: 'money_offer' },
          { text: 'Information.', nextNode: 'info_offer' },
          { text: 'Nothing.', nextNode: 'fight_response' }
        ]
      },
      money_offer: {
        character: 'bandit',
        text: 'How much money are we talking about?',
        choices: [
          { text: '50 gold pieces.', nextNode: 'bribe_50' },
          { text: '100 gold pieces.', nextNode: 'bribe_100' },
          { text: 'Not that much.', nextNode: 'fight_response' }
        ]
      },
      bribe_50: {
        character: 'bandit',
        text: '50 gold? That might buy you passage, but not our respect. Pay up and go.',
        consequences: [
          { type: 'stat_change', stat: 'wealth', delta: -50 }
        ],
        nextNode: null
      },
      bribe_100: {
        character: 'bandit',
        text: 'Now that\'s more like it! Safe travels, friend.',
        consequences: [
          { type: 'stat_change', stat: 'wealth', delta: -100 }
        ],
        nextNode: null
      },
      info_offer: {
        character: 'bandit',
        text: 'Information? What do you know that could interest us?',
        choices: [
          { text: 'Town guard patrol routes.', nextNode: 'info_valuable' },
          { text: 'Nothing useful.', nextNode: 'fight_response' }
        ]
      },
      info_valuable: {
        character: 'bandit',
        text: 'Patrol routes? That could be useful. Tell us more...',
        consequences: [
          { type: 'stat_change', stat: 'reputation', delta: -5 }
        ],
        nextNode: null
      }
    }
  }
};
