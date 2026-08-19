'use client';

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import {
  CheckCircle2, AlertCircle, Loader2, ArrowUp, Trash2, FileText,
  Clock, Bold, Italic, Underline, Strikethrough,
  List, ListOrdered, Quote, RemoveFormatting, Link as LinkIcon, Sparkles,
  Paperclip, X,
} from 'lucide-react';
import { sendMessage } from '@/lib/api';

interface ComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTo?: string;
  initialSubject?: string;
  onSuccess?: (info: { to: string; subject: string; body: string }) => void;
}

interface RecipientItem {
  email: string;
  name?: string;
}

const COMMON_DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'icloud.com', 'ivanaffriandi.com'];

const COLORS = ['#3b82f6', '#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444', '#10b981'];
const getColor = (s: string) => COLORS[(s || 'a').charCodeAt(0) % COLORS.length];

// Rich 1500+ word dictionary for instant reactive prefix matching
const EXTENSIVE_DICTIONARY = [
  'ability', 'about', 'above', 'accept', 'according', 'account', 'across', 'action', 'actually', 'addition',
  'address', 'advance', 'advice', 'advise', 'after', 'afternoon', 'again', 'agenda', 'agree', 'agreement',
  'ahead', 'allow', 'almost', 'already', 'also', 'although', 'always', 'amendment', 'among', 'amount',
  'analysis', 'announce', 'another', 'answer', 'anticipate', 'anyone', 'anything', 'anytime', 'apologize', 'apology',
  'application', 'appreciate', 'approach', 'appropriate', 'approval', 'approve', 'approximate', 'archive', 'arrangement', 'arrival',
  'article', 'assistance', 'assistant', 'associated', 'assume', 'assurance', 'attach', 'attached', 'attachment', 'attempt',
  'attend', 'attention', 'audience', 'audit', 'authorize', 'available', 'average', 'avoid', 'awaiting', 'background',
  'balance', 'bargain', 'barrier', 'because', 'become', 'before', 'behalf', 'behavior', 'behind', 'believe',
  'benefit', 'better', 'between', 'beyond', 'billing', 'blank', 'board', 'bonus', 'bottom', 'branch',
  'brand', 'break', 'brief', 'bring', 'broad', 'browser', 'budget', 'build', 'business', 'calculate',
  'calendar', 'campaign', 'cancel', 'candidate', 'capacity', 'capital', 'career', 'careful', 'carrier', 'category',
  'caution', 'celebrate', 'central', 'certain', 'certificate', 'challenge', 'champion', 'change', 'channel', 'chapter',
  'character', 'charge', 'chart', 'check', 'checklist', 'choice', 'choose', 'circular', 'circumstance', 'citizen',
  'clarify', 'clarification', 'classic', 'clear', 'clearly', 'client', 'climate', 'close', 'closure', 'cloud',
  'cluster', 'coach', 'collaborate', 'collaboration', 'colleague', 'collect', 'collection', 'column', 'combine', 'comfort',
  'command', 'commence', 'comment', 'commerce', 'commercial', 'commission', 'commit', 'commitment', 'committee', 'communicate',
  'communication', 'company', 'compare', 'comparison', 'compelling', 'compensation', 'competence', 'competitive', 'complaint', 'complete',
  'completely', 'compliance', 'complimentary', 'comply', 'component', 'compose', 'comprehensive', 'compromise', 'compute', 'concept',
  'concern', 'conclude', 'conclusion', 'condition', 'conduct', 'conference', 'confidence', 'confident', 'configuration', 'confirm',
  'confirmation', 'conflict', 'conform', 'confuse', 'congratulate', 'congratulations', 'connect', 'connection', 'consent', 'consequence',
  'consider', 'consideration', 'consistently', 'constant', 'constitute', 'consult', 'consultant', 'consumer', 'contact', 'contain',
  'continue', 'continuous', 'contract', 'contrary', 'contrast', 'contribute', 'contribution', 'control', 'convenience', 'convenient',
  'conversation', 'conversion', 'convert', 'convey', 'convince', 'coordinate', 'coordinator', 'corporate', 'correct', 'correction',
  'correspond', 'correspondence', 'corridor', 'counterpart', 'country', 'couple', 'course', 'coverage', 'create', 'creation',
  'creative', 'credit', 'criterion', 'critical', 'critique', 'crucial', 'current', 'currently', 'customer', 'customize',
  'database', 'deadline', 'deal', 'debate', 'decision', 'declaration', 'decrease', 'dedicate', 'default', 'defer',
  'define', 'definite', 'definitely', 'degree', 'delay', 'delegate', 'delete', 'delighted', 'deliver', 'deliverable',
  'delivery', 'demand', 'demonstrate', 'departure', 'depend', 'dependent', 'deposit', 'describe', 'description', 'design',
  'designer', 'desk', 'detail', 'detailed', 'determine', 'develop', 'developer', 'development', 'device', 'devote',
  'diagram', 'dialogue', 'difference', 'different', 'difficult', 'digital', 'direct', 'direction', 'director', 'directory',
  'disable', 'disappointed', 'disaster', 'discipline', 'disclose', 'discount', 'discover', 'discovery', 'discuss', 'discussion',
  'dispatch', 'display', 'disposal', 'dispute', 'distance', 'distinct', 'distribute', 'distribution', 'district', 'document',
  'documentation', 'domain', 'dominant', 'donate', 'double', 'download', 'draft', 'drastic', 'driver', 'duration',
  'earlier', 'early', 'earnings', 'easily', 'economic', 'edition', 'editor', 'educate', 'effective', 'efficiency',
  'efficient', 'effort', 'either', 'elaborate', 'elect', 'electronic', 'element', 'eliminate', 'eligibility', 'eligible',
  'eliminate', 'email', 'embark', 'emergency', 'emphasis', 'employ', 'employee', 'employer', 'employment', 'empower',
  'enable', 'enclose', 'enclosure', 'encourage', 'endeavor', 'endorse', 'endure', 'energy', 'enforce', 'engage',
  'engine', 'engineer', 'enhance', 'enjoy', 'enormous', 'ensure', 'enterprise', 'entire', 'entirely', 'entity',
  'entrance', 'entry', 'envelope', 'environment', 'episode', 'equal', 'equipment', 'equity', 'equivalent', 'error',
  'escalate', 'especially', 'essential', 'establish', 'estimate', 'evaluate', 'evaluation', 'evening', 'event', 'eventually',
  'everyone', 'everything', 'everywhere', 'evidence', 'exact', 'exactly', 'examine', 'example', 'exceed', 'excellent',
  'exception', 'exceptional', 'exchange', 'exclude', 'exclusive', 'execute', 'execution', 'executive', 'exempt', 'exercise',
  'exhibit', 'exist', 'existing', 'expand', 'expansion', 'expect', 'expectation', 'expedite', 'expenditure', 'expense',
  'experience', 'expert', 'expertise', 'explain', 'explanation', 'explicit', 'explore', 'export', 'expose', 'express',
  'extend', 'extension', 'extensive', 'extent', 'external', 'extra', 'extract', 'extreme', 'facility', 'factor',
  'factory', 'failure', 'fairly', 'familiar', 'famous', 'feature', 'federal', 'feedback', 'figure', 'finance',
  'financial', 'finalize', 'findings', 'finish', 'flexible', 'flight', 'floating', 'focus', 'folder', 'follow',
  'following', 'forecast', 'foreign', 'formal', 'format', 'formula', 'forward', 'forwarding', 'foundation', 'framework',
  'freedom', 'frequency', 'frequent', 'frequently', 'friendly', 'friendship', 'fulfill', 'function', 'functional', 'fund',
  'fundamental', 'funding', 'further', 'future', 'gather', 'general', 'generally', 'generate', 'generation', 'generous',
  'genuine', 'geographic', 'global', 'government', 'graduate', 'graphic', 'grateful', 'greatly', 'greeting', 'greetings',
  'guarantee', 'guidance', 'guideline', 'handle', 'happily', 'hardware', 'headline', 'headquarters', 'health', 'healthcare',
  'helpful', 'heritage', 'highlight', 'historic', 'holiday', 'honest', 'honestly', 'honored', 'hopeful', 'hopefully',
  'hospital', 'hospitality', 'however', 'identify', 'identity', 'illustration', 'immediate', 'immediately', 'impact', 'implement',
  'implementation', 'implication', 'import', 'importance', 'important', 'impose', 'impossible', 'impress', 'impression', 'improve',
  'improvement', 'inability', 'inbox', 'incentive', 'incident', 'include', 'including', 'income', 'incorporate', 'increase',
  'incredible', 'incur', 'indeed', 'independence', 'independent', 'indicate', 'indication', 'indicator', 'individual', 'industry',
  'inevitable', 'infant', 'infection', 'infinite', 'inflation', 'influence', 'inform', 'information', 'informative', 'infrastructure',
  'ingredient', 'initial', 'initially', 'initiative', 'injure', 'injury', 'inner', 'innocent', 'innovation', 'input',
  'inquiry', 'inside', 'insight', 'insist', 'inspect', 'inspection', 'inspector', 'inspiration', 'inspire', 'install',
  'installation', 'instance', 'instant', 'instantly', 'instead', 'institute', 'institution', 'instruct', 'instruction', 'instructor',
  'instrument', 'insurance', 'intact', 'integral', 'integrate', 'integration', 'integrity', 'intellectual', 'intelligence', 'intelligent',
  'intend', 'intense', 'intensity', 'intent', 'intention', 'interact', 'interaction', 'interest', 'interested', 'interesting',
  'interface', 'interior', 'intermediate', 'internal', 'international', 'internet', 'interpret', 'interpretation', 'interrupt', 'interval',
  'intervention', 'interview', 'introduce', 'introduction', 'invent', 'inventory', 'invest', 'investigate', 'investigation', 'investment',
  'investor', 'invitation', 'invite', 'invoice', 'involve', 'involved', 'involvement', 'isolate', 'issue', 'item',
  'journey', 'judgment', 'judicial', 'junior', 'justice', 'justify', 'kindly', 'kitchen', 'knowledge', 'landscape',
  'language', 'latest', 'launch', 'layout', 'leadership', 'leading', 'learner', 'learning', 'lecture', 'legacy',
  'legend', 'legislative', 'legitimate', 'leisure', 'length', 'lesson', 'letter', 'liability', 'license', 'lifetime',
  'lightweight', 'likelihood', 'likewise', 'limitation', 'limited', 'linear', 'linguistic', 'listener', 'listing', 'literature',
  'location', 'logical', 'logistics', 'looking', 'loyalty', 'machine', 'magazine', 'magnetic', 'magnificent', 'maintain',
  'maintenance', 'majority', 'management', 'manager', 'mandate', 'mandatory', 'manifest', 'manner', 'manual', 'manufacture',
  'manufacturer', 'manuscript', 'margin', 'marginal', 'market', 'marketing', 'marketplace', 'marvelous', 'material', 'maximize',
  'maximum', 'meaning', 'meaningful', 'measurement', 'mechanism', 'medical', 'medicine', 'medium', 'meeting', 'membership',
  'memorandum', 'memorial', 'mention', 'mentor', 'merchandise', 'merchant', 'message', 'messaging', 'metropolitan', 'middle',
  'migration', 'milestone', 'military', 'million', 'mineral', 'minimal', 'minimum', 'minister', 'ministry', 'minority',
  'minute', 'miracle', 'miserable', 'missile', 'mission', 'mistake', 'mixture', 'mobile', 'moderate', 'modern',
  'modest', 'modification', 'modify', 'module', 'moment', 'monetary', 'monitor', 'monopoly', 'monument', 'monthly',
  'monumental', 'morale', 'mortgage', 'motion', 'motivation', 'multiple', 'municipal', 'museum', 'musical', 'mutual',
  'narrative', 'narrow', 'national', 'native', 'natural', 'nature', 'navigation', 'nearby', 'necessarily', 'necessary',
  'necessity', 'negative', 'negotiate', 'negotiation', 'neighbor', 'neighborhood', 'neither', 'nervous', 'network', 'neutral',
  'nevertheless', 'newsletter', 'next', 'nominal', 'nominate', 'nomination', 'nonetheless', 'normal', 'normally', 'northeastern',
  'northern', 'northwest', 'notable', 'notably', 'notebook', 'notification', 'notified', 'notify', 'novelty', 'nowhere',
  'nuclear', 'numerous', 'nutrition', 'objective', 'obligation', 'observation', 'observe', 'observer', 'obstacle', 'obtain',
  'obvious', 'obviously', 'occasion', 'occasional', 'occasionally', 'occupation', 'occupy', 'occurrence', 'offense', 'offensive',
  'offering', 'official', 'officially', 'offshore', 'ongoing', 'online', 'opening', 'operate', 'operating', 'operation',
  'operational', 'operator', 'opinion', 'opponent', 'opportunity', 'opposite', 'opposition', 'optimism', 'optimistic', 'option',
  'optional', 'ordinary', 'organization', 'organizational', 'organize', 'organized', 'organizer', 'orientation', 'origin', 'original',
  'originally', 'originate', 'outcome', 'outdoor', 'outer', 'outfit', 'outline', 'outlook', 'output', 'outreach',
  'outstanding', 'overall', 'overcome', 'overlook', 'overnight', 'overseas', 'overview', 'package', 'packaging', 'packet',
  'pageant', 'painful', 'painting', 'pamphlet', 'panel', 'panic', 'paradise', 'paradox', 'paragraph', 'parallel',
  'parameter', 'parental', 'parliament', 'partial', 'partially', 'participant', 'participate', 'participation', 'particular', 'particularly',
  'partner', 'partnership', 'passenger', 'passion', 'passionate', 'passive', 'pastime', 'patent', 'patience', 'patient',
  'patiently', 'patron', 'pattern', 'payment', 'peaceful', 'penalty', 'pending', 'pension', 'perceive', 'percentage',
  'perception', 'perfect', 'perfectly', 'perform', 'performance', 'perimeter', 'period', 'periodic', 'peripheral', 'permanent',
  'permanently', 'permission', 'permit', 'perpetual', 'perplex', 'perseverance', 'persist', 'persistent', 'person', 'personal',
  'personality', 'personally', 'personnel', 'perspective', 'persuade', 'persuasion', 'persuasive', 'pertain', 'pertinent', 'pervade',
  'pervasive', 'pessimism', 'pessimistic', 'petition', 'pharmacy', 'phenomenon', 'philosophy', 'phoenix', 'phonetic', 'photograph',
  'photographer', 'photographic', 'photography', 'phrase', 'physical', 'physician', 'physicist', 'physics', 'physiology', 'picturesque',
  'pipeline', 'placement', 'plaintiff', 'planned', 'planner', 'planning', 'platform', 'plausible', 'player', 'pleasant',
  'please', 'pleased', 'pleasing', 'pleasure', 'plenary', 'plentiful', 'plenty', 'plight', 'podcast', 'podium',
  'poetry', 'poignant', 'pointer', 'polarity', 'policy', 'polished', 'politeness', 'political', 'politician', 'politics',
  'pollutant', 'pollution', 'popularity', 'popularize', 'population', 'portable', 'portion', 'portrait', 'portray', 'portrayal',
  'position', 'positive', 'positively', 'possess', 'possession', 'possibility', 'possible', 'possibly', 'postage', 'postcard',
  'poster', 'postpone', 'potential', 'potentially', 'pottery', 'poverty', 'powerful', 'powerfully', 'practical', 'practically',
  'practice', 'practitioner', 'prairie', 'preamble', 'precaution', 'precede', 'precedence', 'precedent', 'preceding', 'precious',
  'precise', 'precisely', 'precision', 'preclude', 'predict', 'predictable', 'prediction', 'predominant', 'prefer', 'preferable',
  'preference', 'preferential', 'prefix', 'prejudice', 'preliminary', 'premature', 'premier', 'premise', 'premium', 'preparation',
  'prepare', 'preparedness', 'prerequisite', 'prescribe', 'prescription', 'presence', 'present', 'presentation', 'presenter', 'preservation',
  'preserve', 'preside', 'presidency', 'president', 'presidential', 'prestige', 'prestigious', 'presumably', 'presume', 'presumption',
  'pretend', 'pretension', 'pretext', 'prevail', 'prevailing', 'prevalence', 'prevalent', 'prevent', 'prevention', 'preventive',
  'preview', 'previous', 'previously', 'priceless', 'primarily', 'primary', 'primate', 'prime', 'primitive', 'principal',
  'principally', 'principle', 'priority', 'privacy', 'private', 'privately', 'privilege', 'privileged', 'probability', 'probable',
  'probably', 'probation', 'procedure', 'procedural', 'proceed', 'proceeding', 'process', 'processing', 'processor', 'proclaim',
  'proclamation', 'procure', 'procurement', 'prodigy', 'produce', 'producer', 'product', 'production', 'productive', 'productivity',
  'profession', 'professional', 'professionally', 'professor', 'proficiency', 'proficient', 'profile', 'profit', 'profitable', 'profound',
  'profoundly', 'program', 'programme', 'programmer', 'programming', 'progress', 'progression', 'progressive', 'prohibit', 'prohibition',
  'project', 'projection', 'projector', 'prominence', 'prominent', 'prominently', 'promise', 'promising', 'promote', 'promoter',
  'promotion', 'promotional', 'prompt', 'promptly', 'promptness', 'prone', 'pronounce', 'pronunciation', 'proof', 'propaganda',
  'propel', 'propeller', 'proper', 'properly', 'property', 'prophecy', 'prophet', 'prophetic', 'proportion', 'proportional',
  'proposal', 'propose', 'proposition', 'proprietor', 'prose', 'prosecute', 'prosecution', 'prosecutor', 'prospect', 'prospective',
  'prospectus', 'prosperity', 'prosperous', 'protect', 'protection', 'protective', 'protector', 'protocol', 'prototype', 'proud',
  'proudly', 'provable', 'prove', 'proven', 'provide', 'provided', 'provider', 'province', 'provincial', 'provision',
  'provisional', 'provoke', 'proximity', 'prudence', 'prudent', 'public', 'publication', 'publicity', 'publicize', 'publicly',
  'publish', 'publisher', 'publishing', 'punctual', 'punctuality', 'purchase', 'purchaser', 'purchasing', 'purely', 'purify',
  'purity', 'purpose', 'purposeful', 'purposely', 'pursuant', 'pursue', 'pursuit', 'qualify', 'qualification', 'qualitative',
  'quality', 'quantifiable', 'quantity', 'quantum', 'quarterly', 'question', 'questionable', 'questionnaire', 'queue', 'quick',
  'quickly', 'quickness', 'quietly', 'quintessence', 'quota', 'quotation', 'quote', 'radiation', 'radical', 'radioactive',
  'radius', 'railroad', 'rainbow', 'rally', 'random', 'randomly', 'ranging', 'rapid', 'rapidly', 'rapport',
  'rarely', 'ratification', 'ratify', 'rational', 'rationale', 'rationalize', 'reaction', 'readily', 'readiness', 'realistic',
  'reality', 'realization', 'realize', 'reallocate', 'reasonable', 'reasonably', 'reassure', 'reassurance', 'rebate', 'rebound',
  'recall', 'receipt', 'receive', 'receiver', 'recent', 'recently', 'reception', 'receptionist', 'recession', 'recipe',
  'recipient', 'reciprocal', 'reciprocate', 'reckon', 'reclaim', 'recognition', 'recognize', 'recommend', 'recommendation', 'reconcile',
  'reconciliation', 'reconnaissance', 'reconsider', 'reconstruct', 'reconstruction', 'record', 'recorder', 'recording', 'recover', 'recovery',
  'recreation', 'recruit', 'recruitment', 'rectangle', 'rectify', 'recurring', 'redemption', 'redistribute', 'redistribution', 'reduction',
  'redundancy', 'redundant', 'reference', 'referendum', 'referral', 'refine', 'refinement', 'reflect', 'reflection', 'reflective',
  'reform', 'reformation', 'refrain', 'refresh', 'refreshing', 'refreshment', 'refrigerator', 'refund', 'refundable', 'refusal',
  'refuse', 'regard', 'regarding', 'regardless', 'regards', 'regime', 'regiment', 'region', 'regional', 'register',
  'registration', 'registry', 'regression', 'regret', 'regrettable', 'regrettably', 'regular', 'regularity', 'regularly', 'regulate',
  'regulation', 'regulatory', 'rehabilitate', 'rehabilitation', 'rehearse', 'reinforce', 'reinforcement', 'reinstate', 'reinvestment', 'reiterate',
  'reject', 'rejection', 'rejoice', 'relate', 'relation', 'relationship', 'relative', 'relatively', 'relativity', 'relaxation',
  'release', 'relevance', 'relevant', 'reliability', 'reliable', 'reliably', 'reliance', 'reliant', 'relief', 'relieve',
  'relinquish', 'relocate', 'relocation', 'reluctance', 'reluctant', 'reluctantly', 'rely', 'remain', 'remainder', 'remaining',
  'remark', 'remarkable', 'remarkably', 'remedy', 'remember', 'remembrance', 'remind', 'reminder', 'remittance', 'remnant',
  'remodel', 'remote', 'removal', 'remove', 'render', 'rendezvous', 'renew', 'renewable', 'renewal', 'renovate',
  'renovation', 'renowned', 'rental', 'reorganize', 'repair', 'reparation', 'repay', 'repayment', 'repeal', 'repeat',
  'repeatedly', 'replace', 'replacement', 'replenish', 'replica', 'replicate', 'replication', 'reply', 'report', 'reporter',
  'reporting', 'repose', 'repository', 'represent', 'representation', 'representative', 'repress', 'repression', 'reprieve', 'reprimand',
  'reprisal', 'reproach', 'reproduce', 'reproduction', 'reproductive', 'reproof', 'republic', 'republican', 'repudiate', 'repugnant',
  'repulsion', 'repulsive', 'reputable', 'reputation', 'request', 'requester', 'require', 'requirement', 'requisite', 'requisition',
  'reschedule', 'rescind', 'rescue', 'research', 'researcher', 'resemblance', 'resemble', 'resent', 'resentment', 'reservation',
  'reserve', 'reservoir', 'reside', 'residence', 'resident', 'residential', 'residual', 'residue', 'resign', 'resignation',
  'resilience', 'resilient', 'resist', 'resistance', 'resistant', 'resolute', 'resolution', 'resolve', 'resonance', 'resonant',
  'resort', 'resource', 'resourceful', 'respect', 'respectable', 'respectful', 'respectfully', 'respective', 'respectively', 'respite',
  'respond', 'respondent', 'response', 'responsibility', 'responsible', 'responsibly', 'responsive', 'responsiveness', 'restart', 'restaurant',
  'restoration', 'restore', 'restrain', 'restraint', 'restrict', 'restriction', 'restrictive', 'restructure', 'result', 'resultant',
  'resume', 'resumption', 'retail', 'retailer', 'retain', 'retainer', 'retaliate', 'retaliation', 'retention', 'retentive',
  'retire', 'retiree', 'retirement', 'retract', 'retraction', 'retreat', 'retribution', 'retrieve', 'retrieval', 'retroactive',
  'retrospect', 'retrospective', 'return', 'reunion', 'reunite', 'reveal', 'revelation', 'revenue', 'reverence', 'reverent',
  'reverse', 'reversal', 'reversible', 'reversion', 'revert', 'review', 'reviewer', 'revise', 'revision', 'revival',
  'revive', 'revoke', 'revolt', 'revolution', 'revolutionary', 'revolve', 'reward', 'rewarding', 'rhythm', 'rhythmic',
  'rigorous', 'robust', 'routine', 'routinely', 'safeguard', 'salutation', 'sample', 'satisfaction', 'satisfactory', 'satisfied',
  'satisfy', 'schedule', 'scheduled', 'scheduler', 'scheduling', 'scheme', 'scholar', 'scholarship', 'science', 'scientific',
  'scientist', 'scope', 'screen', 'screening', 'scrutiny', 'seamless', 'search', 'seasonal', 'secondly', 'secretarial',
  'secretary', 'section', 'sector', 'secure', 'securely', 'security', 'segment', 'selection', 'selective', 'semester',
  'seminar', 'senate', 'senator', 'senior', 'sensitive', 'sensitivity', 'sentence', 'sentiment', 'separate', 'separately',
  'sequence', 'serial', 'series', 'serious', 'seriously', 'service', 'session', 'settle', 'settlement', 'severe',
  'severely', 'severity', 'shareholder', 'sharing', 'shipment', 'shipping', 'shortage', 'shortly', 'showcase', 'signature',
  'significance', 'significant', 'significantly', 'silence', 'similar', 'similarity', 'similarly', 'simple', 'simplicity', 'simplified',
  'simplify', 'simply', 'simulate', 'simulation', 'simultaneous', 'sincere', 'sincerely', 'sincerity', 'single', 'situation',
  'skeleton', 'skilled', 'smoothly', 'snapshot', 'so-called', 'social', 'software', 'solely', 'solicit', 'solid',
  'solitary', 'solution', 'somebody', 'someday', 'somehow', 'someone', 'something', 'sometime', 'sometimes', 'somewhere',
  'sophisticated', 'soundtrack', 'source', 'spacious', 'special', 'specialist', 'specialize', 'specialty', 'specific', 'specifically',
  'specification', 'specify', 'specimen', 'spectacle', 'spectacular', 'spectator', 'spectrum', 'speculate', 'speculation', 'speculative',
  'spokesman', 'spokesperson', 'sponsor', 'sponsorship', 'spontaneous', 'sporadic', 'spotlight', 'stabilize', 'stability', 'stable',
  'stadium', 'staffing', 'stage', 'stagnant', 'stainless', 'stakeholder', 'standard', 'standardize', 'standing', 'standpoint',
  'start-up', 'statement', 'station', 'stationary', 'stationery', 'statistical', 'statistically', 'statistician', 'statistics', 'statue',
  'stature', 'status', 'statute', 'statutory', 'steadily', 'steady', 'steering', 'stimulate', 'stimulation', 'stimulus',
  'stipulate', 'stipulation', 'storage', 'straightforward', 'strategic', 'strategically', 'strategy', 'strength', 'strengthen', 'strenuous',
  'stress', 'stressful', 'strict', 'strictly', 'striking', 'structure', 'structured', 'struggle', 'student', 'studio',
  'study', 'stylish', 'subcontract', 'subcontractor', 'subdivide', 'subdivision', 'subject', 'subjective', 'submission', 'submit',
  'subordinate', 'subscribe', 'subscriber', 'subscription', 'subsequent', 'subsequently', 'subsidize', 'subsidy', 'substance', 'substantial',
  'substantially', 'substantiate', 'substitute', 'substitution', 'substrate', 'subsystem', 'subtle', 'subtract', 'suburb', 'suburban',
  'succeed', 'success', 'successful', 'successfully', 'succession', 'successive', 'successor', 'succinct', 'sufficient', 'sufficiently',
  'suggest', 'suggestion', 'suggestive', 'suitable', 'suitably', 'suitcase', 'summary', 'summit', 'superb', 'superficial',
  'superintendent', 'superior', 'superiority', 'supermarket', 'supernatural', 'supersede', 'supervise', 'supervision', 'supervisor', 'supervisory',
  'supplement', 'supplementary', 'supplier', 'supply', 'support', 'supporter', 'supportive', 'suppose', 'supposedly', 'supposition',
  'suppress', 'suppression', 'supreme', 'surcharge', 'surely', 'surface', 'surgeon', 'surgery', 'surgical', 'surmount',
  'surpass', 'surplus', 'surprise', 'surprising', 'surprisingly', 'surrender', 'surround', 'surrounding', 'surveillance', 'survey',
  'surveyor', 'survival', 'survive', 'survivor', 'suspect', 'suspend', 'suspense', 'suspension', 'suspicion', 'suspicious',
  'sustain', 'sustainable', 'sustained', 'sustenance', 'swap', 'swarm', 'symbol', 'symbolic', 'symbolize', 'symmetry',
  'sympathetic', 'sympathize', 'sympathy', 'symptom', 'syndicate', 'syndrome', 'synergy', 'synonym', 'synonymous', 'synopsis',
  'syntax', 'synthesis', 'synthetic', 'system', 'systematic', 'systematically', 'table', 'tablet', 'tackle', 'tactful',
  'tactic', 'tactical', 'tactics', 'tailor', 'takeover', 'talent', 'talented', 'tangible', 'target', 'tariff',
  'task', 'tasteful', 'taxation', 'taxonomy', 'taxpayer', 'teacher', 'teaching', 'teamwork', 'technical', 'technically',
  'technician', 'technique', 'technological', 'technology', 'telecom', 'teleconference', 'telegram', 'telegraph', 'telephone', 'telescope',
  'television', 'template', 'temporary', 'temporarily', 'tenacious', 'tenacity', 'tenant', 'tendency', 'tender', 'tenure',
  'terminal', 'terminate', 'termination', 'terminology', 'terrace', 'terrific', 'territory', 'territorial', 'testament', 'testimonial',
  'testimony', 'testing', 'textbook', 'textile', 'thank', 'thankful', 'thankfully', 'thanks', 'theme', 'theorem',
  'theoretical', 'theoretically', 'theorist', 'theory', 'therapeutic', 'therapist', 'therapy', 'thereafter', 'thereby', 'therefore',
  'thereof', 'thereon', 'thereto', 'thereupon', 'therewith', 'thermal', 'thesaurus', 'thesis', 'thorough', 'thoroughly',
  'thoughtful', 'thoughtfully', 'thoughtless', 'threshold', 'thrive', 'through', 'throughout', 'throughput', 'thursday', 'ticket',
  'timeline', 'timely', 'timetable', 'timing', 'tireless', 'title', 'tobacco', 'together', 'tolerance', 'tolerant',
  'tolerate', 'toll-free', 'tomorrow', 'tonight', 'tonnage', 'toolbox', 'toolkit', 'top-notch', 'topic', 'topical',
  'topography', 'torment', 'tornado', 'torrent', 'torture', 'total', 'totally', 'touching', 'toughness', 'tourism',
  'tourist', 'tournament', 'toxic', 'trace', 'traceable', 'track', 'tracking', 'traction', 'trade', 'trademark',
  'trader', 'tradesman', 'trading', 'tradition', 'traditional', 'traditionally', 'traffic', 'tragedy', 'tragic', 'trail',
  'trailer', 'trainee', 'trainer', 'training', 'trait', 'trajectory', 'transaction', 'transcribe', 'transcript', 'transcription',
  'transfer', 'transferable', 'transference', 'transform', 'transformation', 'transformer', 'transfuse', 'transfusion', 'transgress', 'transgression',
  'transient', 'transistor', 'transit', 'transition', 'transitional', 'translate', 'translation', 'translator', 'translucent', 'transmission',
  'transmit', 'transmitter', 'transparency', 'transparent', 'transpiration', 'transpire', 'transplant', 'transport', 'transportation', 'transposition',
  'transverse', 'traveler', 'traveling', 'treasure', 'treasurer', 'treasury', 'treatment', 'treaty', 'tremendous', 'tremendously',
  'tribal', 'tribute', 'trigger', 'triumph', 'troubleshoot', 'troubleshooting', 'trustee', 'trustworthy', 'tuesday', 'tuition',
  'turnaround', 'turnover', 'tutorial', 'ultimate', 'ultimately', 'unanimous', 'unanimously', 'unavoidable', 'unbelievable', 'uncertain',
  'uncertainty', 'unconditional', 'underestimate', 'undergo', 'undergraduate', 'underline', 'underlying', 'undermine', 'underneath', 'understand',
  'understanding', 'undertake', 'undertaking', 'underwrite', 'underwriter', 'undoubtedly', 'unemployment', 'unexpected', 'unexpectedly', 'unfavorable',
  'unfold', 'unforeseen', 'unfortunate', 'unfortunately', 'uniform', 'uniformity', 'unilateral', 'unique', 'uniquely', 'universal',
  'universally', 'university', 'unlimited', 'unnecessary', 'unprecedented', 'unpredictable', 'unravel', 'unrestricted', 'unrivaled', 'unsatisfactory',
  'unspecified', 'unsuccessful', 'unsuitable', 'unveil', 'unwarranted', 'upcoming', 'update', 'upgrade', 'uplift', 'upload',
  'upon', 'uppercase', 'upperclass', 'upright', 'uprising', 'uproar', 'upscale', 'upset', 'upshot', 'upside',
  'upstairs', 'upstanding', 'upstart', 'upstream', 'upward', 'upwards', 'urgency', 'urgent', 'urgently', 'usable',
  'usage', 'useful', 'usefully', 'usefulness', 'useless', 'username', 'user-friendly', 'usual', 'usually', 'utility',
  'utilization', 'utilize', 'utmost', 'utterance', 'utterly', 'vacancy', 'vacant', 'vacate', 'vacation', 'vaccination',
  'vaccine', 'vacuum', 'vague', 'vaguely', 'vagueness', 'vain', 'valediction', 'valedictorian', 'valiant', 'valiantly',
  'valid', 'validate', 'validation', 'validity', 'valley', 'valorous', 'valuable', 'valuation', 'value', 'valued',
  'valve', 'vandalism', 'vanguard', 'vanish', 'vanity', 'vanquish', 'variable', 'variance', 'variant', 'variation',
  'variegate', 'variety', 'various', 'variously', 'vascular', 'vector', 'vegetation', 'vehicle', 'velocity', 'vendor',
  'venerable', 'vengeance', 'venture', 'venue', 'veracity', 'veranda', 'verbal', 'verbally', 'verbatim', 'verbiage',
  'verdict', 'verification', 'verify', 'veritable', 'vernacular', 'versatile', 'versatility', 'version', 'versus', 'vertical',
  'vertically', 'vessel', 'veteran', 'veterinary', 'viable', 'viability', 'vibrant', 'vibrate', 'vibration', 'vicar',
  'vicinity', 'vicious', 'victim', 'victor', 'victorious', 'victory', 'viewpoint', 'vigilance', 'vigilant', 'vigor',
  'vigorous', 'vigorously', 'village', 'villain', 'vindicate', 'vindication', 'vineyard', 'vintage', 'violate', 'violation',
  'violence', 'violent', 'violently', 'virtual', 'virtually', 'virtue', 'virtuous', 'virulence', 'virulent', 'vis-a-vis',
  'visibility', 'visible', 'visibly', 'vision', 'visionary', 'visitor', 'visual', 'visualize', 'vital', 'vitality',
  'vitamin', 'vivid', 'vividly', 'vocation', 'vocational', 'voice', 'volatility', 'volcanic', 'volcano', 'voltage',
  'volubility', 'volume', 'voluntary', 'volunteer', 'vortex', 'votary', 'voter', 'voting', 'vouch', 'voucher',
  'voyage', 'vulgar', 'vulnerability', 'vulnerable', 'wager', 'waive', 'waiver', 'walkway', 'warehouse', 'warfare',
  'warmth', 'warrant', 'warranty', 'warrior', 'wastage', 'watchful', 'waterfall', 'waterfront', 'wavelength', 'waypoint',
  'weakness', 'wealth', 'wealthy', 'weapon', 'weariness', 'webcast', 'webinar', 'website', 'weekday', 'weekend',
  'weekly', 'welcome', 'welcoming', 'welfare', 'well-being', 'well-known', 'well-rounded', 'wellness', 'whatever', 'whatsoever',
  'whenever', 'whereabouts', 'whereas', 'whereby', 'wherein', 'wherever', 'whichever', 'wholesaler', 'wholesome', 'widespread',
  'wildlife', 'willingness', 'windfall', 'wireless', 'wisdom', 'withdraw', 'withdrawal', 'withhold', 'within', 'without',
  'withstand', 'witness', 'wizard', 'wonderful', 'wonderfully', 'workable', 'workbench', 'workbook', 'workday', 'workforce',
  'workhorse', 'working', 'workload', 'workplace', 'worksheet', 'workshop', 'workspace', 'workstation', 'worldwide', 'worthwhile',
  'worthless', 'wrap-up', 'wreckage', 'wristband', 'writ-down', 'write-off', 'writer', 'writhe', 'writing', 'wrongdoing',
  'xerography', 'yacht', 'yardstick', 'yearbook', 'yearlong', 'yearly', 'yearning', 'yesterday', 'yielding', 'youthful',
  'zeal', 'zealous', 'zenith', 'zero', 'zigzag', 'zipper', 'zodiac', 'zone', 'zoning', 'zoology'
];

const CONTEXT_TRIGGERS: Record<string, string[]> = {
  'hi': ['there,', 'everyone,', 'team,', 'how are you doing?'],
  'hello': ['there,', 'everyone,', 'team,', 'hope you are doing well.'],
  'dear': ['all,', 'colleagues,', 'customer,', 'team,'],
  'good': ['morning,', 'afternoon,', 'evening,', 'news!'],
  'thank': ['you', 'you very much', 'for your prompt response,', 'for reaching out.'],
  'thanks': ['for the update,', 'for your help,', 'again,', 'for your time.'],
  'please': ['find the attached', 'let me know if you need', 'review the document', 'confirm your availability'],
  'let': ['me know your thoughts,', 'us know if you have questions,', 'me know what time works best.'],
  'looking': ['forward to hearing from you,', 'forward to our meeting,', 'forward to working together.'],
  'attached': ['is the invoice,', 'are the files for your review,', 'is the latest update.'],
  'attached:': ['document.pdf', 'invoice.pdf', 'report.docx'],
  'sorry': ['for the delay in getting back to you,', 'for the confusion,', 'for any inconvenience.'],
  'apologies': ['for the delay,', 'for any inconvenience caused,', 'for missing your earlier email.'],
  'regarding': ['our previous conversation,', 'your recent inquiry,', 'the project timeline,'],
  'schedule': ['a quick 15-minute call?', 'a meeting for tomorrow?', 'a follow-up session?'],
  'meeting': ['tomorrow at 10 AM?', 'notes are summarized below.', 'agenda is attached.'],
  'update': ['on the project status:', 'regarding the recent release:', 'as discussed earlier:'],
  'best': ['regards,\nIvan Affriandi', 'wishes,\nIvan Affriandi', 'regards,', 'wishes,'],
  'kind': ['regards,\nIvan Affriandi', 'wishes,\nIvan Affriandi', 'regards,'],
  'sincerely': ['yours,\nIvan Affriandi', 'Ivan Affriandi'],
  'warm': ['regards,\nIvan Affriandi', 'wishes,\nIvan Affriandi'],
};

export const ComposerModal: React.FC<ComposerModalProps> = ({
  isOpen,
  onClose,
  initialTo = '',
  initialSubject = '',
  onSuccess,
}) => {
  const [recipients, setRecipients] = useState<RecipientItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [subject, setSubject] = useState(initialSubject);
  const [isSending, setIsSending] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [history, setHistory] = useState<RecipientItem[]>([]);
  const [suggestions, setSuggestions] = useState<RecipientItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sendResult, setSendResult] = useState<'success' | 'error' | null>(null);
  const [wordSuggestions, setWordSuggestions] = useState<string[]>(['actually', 'please', 'thanks', 'regards']);
  const [attachments, setAttachments] = useState<{ filename: string; content_type: string; data_base64: string; size_bytes: number }[]>([]);

  const modalContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAttachFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const base64Data = dataUrl.split(',')[1] || '';
        setAttachments((prev) => [
          ...prev,
          {
            filename: file.name,
            content_type: file.type || 'application/octet-stream',
            data_base64: base64Data,
            size_bytes: file.size,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Load recipient history & drafts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('composer_recipient_history');
        if (saved) setHistory(JSON.parse(saved));

        const savedDraft = localStorage.getItem('composer_saved_draft');
        if (savedDraft && !initialSubject && !initialTo) {
          const draft = JSON.parse(savedDraft);
          if (draft.recipients) setRecipients(draft.recipients);
          if (draft.subject) setSubject(draft.subject);
          if (draft.body && editorRef.current) editorRef.current.innerHTML = draft.body;
        }
      } catch { /* use empty */ }
    }
  }, [initialSubject, initialTo]);

  // Sync initial props
  useEffect(() => {
    if (initialTo) setRecipients([{ email: initialTo }]);
    if (initialSubject) setSubject(initialSubject);
  }, [initialTo, initialSubject]);

  // Check if editor has unsaved text
  const hasUnsavedContent = () => {
    const text = editorRef.current?.innerText.trim() || '';
    return text.length > 0 || subject.trim().length > 0 || recipients.length > 0;
  };

  // Trigger Genie close
  const triggerGenieClose = () => {
    setIsClosing(true);
    setShowConfirmClose(false);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 280);
  };

  // Close request handler (triggered by tap outside)
  const handleRequestClose = () => {
    if (hasUnsavedContent() && !showConfirmClose) {
      setShowConfirmClose(true);
    } else {
      triggerGenieClose();
    }
  };

  // Tap outside listener
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDownOutside = (e: MouseEvent | TouchEvent) => {
      if (modalContainerRef.current && !modalContainerRef.current.contains(e.target as Node)) {
        handleRequestClose();
      }
    };

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleRequestClose();
      }
    };

    document.addEventListener('mousedown', handlePointerDownOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDownOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, recipients, subject, showConfirmClose]);

  // Discard draft
  const handleDiscard = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('composer_saved_draft');
    }
    setRecipients([]);
    setSubject('');
    setInputValue('');
    if (editorRef.current) editorRef.current.innerHTML = '';
    triggerGenieClose();
  };

  // Save as draft
  const handleSaveDraft = () => {
    if (typeof window !== 'undefined') {
      const draft = {
        recipients,
        subject,
        body: editorRef.current?.innerHTML || '',
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('composer_saved_draft', JSON.stringify(draft));
    }
    triggerGenieClose();
  };

  // Add recipient
  const addRecipient = (emailStr: string, name?: string) => {
    const clean = emailStr.trim().toLowerCase().replace(/^[<"']+|[>"',]+$/g, '');
    if (!clean) return;

    if (!recipients.some((r) => r.email === clean)) {
      const updated = [...recipients, { email: clean, name }];
      setRecipients(updated);

      const newHistory = [
        { email: clean, name },
        ...history.filter((h) => h.email !== clean),
      ].slice(0, 20);
      setHistory(newHistory);
      if (typeof window !== 'undefined') {
        localStorage.setItem('composer_recipient_history', JSON.stringify(newHistory));
      }
    }
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
    inputRef.current?.focus();
  };

  // Recipient input & autocomplete
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    if (!val.trim()) {
      setShowSuggestions(false);
      return;
    }

    if (val.includes('@')) {
      const [userPart, domainPart = ''] = val.split('@');
      const matched = COMMON_DOMAINS.filter((d) => d.startsWith(domainPart.toLowerCase())).map((d) => ({
        email: `${userPart}@${d}`,
      }));
      setSuggestions(matched);
      setShowSuggestions(matched.length > 0);
    } else {
      const matched = history.filter(
        (h) =>
          h.email.toLowerCase().includes(val.toLowerCase()) ||
          (h.name && h.name.toLowerCase().includes(val.toLowerCase()))
      );
      setSuggestions(matched);
      setShowSuggestions(matched.length > 0);
    }
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (['Enter', ',', 'Tab'].includes(e.key)) {
      e.preventDefault();
      if (suggestions.length > 0 && showSuggestions) {
        addRecipient(suggestions[0].email, suggestions[0].name);
      } else if (inputValue.trim()) {
        addRecipient(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && recipients.length > 0) {
      removeRecipient(recipients.length - 1);
    }
  };

  // Rich text formatting
  const formatDoc = (cmd: string, val: string = '') => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
  };

  const handleInsertLink = () => {
    const url = prompt('Enter web link URL:');
    if (url) formatDoc('createLink', url);
  };

  // Ultra-Sensitive & Intelligent Word Prediction Engine
  const detectSmartWords = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    const cleanText = text.replace(/\u00a0/g, ' ');
    const tokens = cleanText.split(/[\s\n\r]+/);
    const lastWord = (tokens[tokens.length - 1] || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').trim();
    const secondLastWord = (tokens[tokens.length - 2] || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').trim();

    // 1. Direct Prefix Completion (e.g., "actuall" -> "actually", "sched" -> "schedule", "meet" -> "meeting")
    if (lastWord.length >= 1) {
      const prefixMatches = EXTENSIVE_DICTIONARY.filter(
        (w) => w.startsWith(lastWord) && w !== lastWord
      ).slice(0, 5);

      if (prefixMatches.length > 0) {
        setWordSuggestions(prefixMatches);
        return;
      }
    }

    // 2. Next Word Contextual Prediction based on last full word
    const trigger = lastWord || secondLastWord;
    if (trigger && CONTEXT_TRIGGERS[trigger]) {
      setWordSuggestions(CONTEXT_TRIGGERS[trigger]);
      return;
    }

    // 3. Fallback High-Utility Contextual Suggestions
    if (text.length === 0) {
      setWordSuggestions(['Dear', 'Hi', 'Hello', 'Good morning,', 'Good afternoon,']);
    } else {
      setWordSuggestions(['actually', 'please', 'thanks', 'regards', 'attached']);
    }
  };

  // Insert suggested word into editor
  const insertWord = (suggestedWord: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    const text = editorRef.current.innerText || '';
    const tokens = text.split(/[\s\n\r]+/);
    const lastWord = (tokens[tokens.length - 1] || '').trim();

    // If the suggestion is a completion for the last typed prefix, complete it
    if (lastWord.length >= 1 && suggestedWord.toLowerCase().startsWith(lastWord.toLowerCase())) {
      const remainingSuffix = suggestedWord.slice(lastWord.length);
      document.execCommand('insertText', false, remainingSuffix + ' ');
    } else {
      document.execCommand('insertText', false, suggestedWord + ' ');
    }

    setTimeout(detectSmartWords, 20);
  };

  // Handle Send Email
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalEmails = recipients.map((r) => r.email);
    if (inputValue.trim()) finalEmails.push(inputValue.trim());

    if (finalEmails.length === 0) {
      inputRef.current?.focus();
      return;
    }

    const editorHtml = editorRef.current?.innerHTML || '';
    const editorText = editorRef.current?.innerText || '';

    setIsSending(true);
    setSendResult(null);

    try {
      await sendMessage({
        to: finalEmails,
        subject: subject || '(No Subject)',
        body_html: editorHtml || `<p>${editorText}</p>`,
        body_plain: editorText,
        attachments: attachments.map(a => ({
          filename: a.filename,
          content_type: a.content_type,
          data_base64: a.data_base64,
        })),
      });

      setSendResult('success');
      if (onSuccess) onSuccess({ to: finalEmails.join(', '), subject: subject || '(No Subject)', body: editorText });

      if (typeof window !== 'undefined') {
        localStorage.removeItem('composer_saved_draft');
      }

      setTimeout(() => {
        triggerGenieClose();
        setRecipients([]);
        setInputValue('');
        setSubject('');
        setAttachments([]);
        if (editorRef.current) editorRef.current.innerHTML = '';
        setSendResult(null);
      }, 1000);
    } catch (err) {
      console.error('Send error:', err);
      setSendResult('error');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen && !isClosing) return null;

  return (
    <>
      {/* Background Dimming Backdrop (Subtle focus backdrop) */}
      <div
        className={`fixed inset-0 bg-black/25 dark:bg-black/45 backdrop-blur-[2px] z-[150] select-none apple-transition ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />

      <div
        ref={modalContainerRef}
        className={`fixed inset-x-2.5 bottom-2.5 md:bottom-6 md:right-6 md:left-auto md:w-[580px] max-w-full md:max-w-[94vw] max-h-[94vh] overflow-y-auto no-scrollbar z-[160] select-none flex flex-col gap-2 font-sans ${
          isClosing ? 'animate-genie-out' : 'animate-genie-in'
        }`}
      >
        {/* Sending Result Banner */}
        {sendResult && (
          <div className={`px-4 py-2 text-xs font-bold flex items-center gap-2 rounded-2xl shadow-lg animate-toast ${
            sendResult === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {sendResult === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{sendResult === 'success' ? '✓ Message dispatched successfully!' : '✗ Failed to send message. Please try again.'}</span>
          </div>
        )}

        {/* 1. Separate Top Floating Metadata Card */}
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl md:rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.25)] ring-1 ring-black/5 dark:ring-white/10 p-3 md:p-4 space-y-2.5 apple-transition">
          {/* Title Tag */}
          <div className="flex items-center gap-2 px-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-wider">
              {subject?.toLowerCase().startsWith('re:') ? 'Reply' : subject?.toLowerCase().startsWith('fwd:') ? 'Forward' : 'New Message'}
            </span>
          {recipients.length > 0 && (
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-bold border border-blue-500/20">
              {recipients.length} {recipients.length === 1 ? 'recipient' : 'recipients'}
            </span>
          )}
        </div>

        {/* TO Field */}
        <div className="flex items-center gap-2 border-t border-[var(--border-subtle)] pt-2.5">
          <span className="text-xs font-bold text-[var(--text-muted)] w-14 shrink-0 pl-1">To:</span>
          <div className="flex-1 relative">
            <div className="flex flex-wrap items-center gap-1.5 min-h-[28px]">
              {recipients.map((rec, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow-2xs animate-fade-in"
                  style={{ backgroundColor: getColor(rec.email) }}
                >
                  <span>{rec.name ? `${rec.name} (${rec.email})` : rec.email}</span>
                  <button
                    type="button"
                    onClick={() => removeRecipient(i)}
                    className="p-0.5 hover:bg-black/20 rounded-full"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                onFocus={() => inputValue && setShowSuggestions(true)}
                placeholder={recipients.length === 0 ? 'Type email address or name…' : ''}
                className="flex-1 min-w-[140px] bg-transparent text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none font-sans font-medium"
              />
            </div>

            {/* Autocomplete Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-2xl z-50 overflow-hidden font-sans max-h-44 overflow-y-auto ring-1 ring-black/10 dark:ring-white/15">
                <div className="p-1.5 text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider px-3 border-b border-[var(--border-subtle)] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Suggested Recipients</span>
                </div>
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => addRecipient(item.email, item.name)}
                    className="w-full text-left px-3.5 py-2 hover:bg-[var(--bg-color)] flex items-center justify-between text-xs apple-transition"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-extrabold"
                        style={{ backgroundColor: getColor(item.email) }}
                      >
                        {item.email.charAt(0).toUpperCase()}
                      </span>
                      <span className="font-semibold text-[var(--text-primary)]">{item.name || item.email}</span>
                    </div>
                    {item.name && <span className="text-[11px] text-[var(--text-muted)] font-mono">{item.email}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Subject Field */}
        <div className="flex items-center gap-2 border-t border-[var(--border-subtle)] pt-2.5">
          <span className="text-xs font-bold text-[var(--text-muted)] w-14 shrink-0 pl-1">Subject:</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Write a clear subject…"
            className="flex-1 bg-transparent text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none font-sans font-medium"
          />
        </div>
      </div>

      {/* 2. Separate Center Floating Editor Card */}
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.25)] ring-1 ring-black/5 dark:ring-white/10 p-4 space-y-2.5 apple-transition">
        {/* Formatting Toolbar */}
        <div className="flex items-center gap-0.5 pb-1.5 border-b border-[var(--border-subtle)] text-[var(--text-secondary)] overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => formatDoc('bold')}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-color)] hover:text-[var(--text-primary)] apple-transition"
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => formatDoc('italic')}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-color)] hover:text-[var(--text-primary)] apple-transition"
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => formatDoc('underline')}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-color)] hover:text-[var(--text-primary)] apple-transition"
            title="Underline"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => formatDoc('strikeThrough')}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-color)] hover:text-[var(--text-primary)] apple-transition"
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3.5 bg-[var(--border-subtle)] mx-1" />
          <button
            type="button"
            onClick={() => formatDoc('insertUnorderedList')}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-color)] hover:text-[var(--text-primary)] apple-transition"
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => formatDoc('insertOrderedList')}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-color)] hover:text-[var(--text-primary)] apple-transition"
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => formatDoc('formatBlock', 'blockquote')}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-color)] hover:text-[var(--text-primary)] apple-transition"
            title="Quote"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleInsertLink}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-color)] hover:text-[var(--text-primary)] apple-transition"
            title="Insert Link"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3.5 bg-[var(--border-subtle)] mx-1" />
          <button
            type="button"
            onClick={() => formatDoc('removeFormat')}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-color)] hover:text-[var(--text-primary)] apple-transition"
            title="Clear Formatting"
          >
            <RemoveFormatting className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Attachment Chips Preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 p-2 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--card-border)] animate-fade-in shrink-0">
            {attachments.map((att, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-[11px] font-semibold text-[var(--text-primary)] shadow-2xs"
              >
                <Paperclip className="w-3 h-3 text-blue-500 shrink-0" />
                <span className="truncate max-w-[130px]">{att.filename}</span>
                <span className="text-[9px] text-[var(--text-muted)] font-mono">({(att.size_bytes / 1024).toFixed(0)} KB)</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(i)}
                  className="p-0.5 rounded-full hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 apple-transition ml-0.5"
                  title="Remove attachment"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Contenteditable Rich Text Area */}
        <div
          ref={editorRef}
          contentEditable
          role="textbox"
          aria-multiline="true"
          onInput={detectSmartWords}
          onKeyUp={detectSmartWords}
          onKeyDown={detectSmartWords}
          className="w-full min-h-[170px] max-h-[250px] overflow-y-auto p-1 text-xs text-[var(--text-primary)] focus:outline-none leading-relaxed font-sans empty:before:content-['Write_your_message_here...'] empty:before:text-[var(--text-muted)]"
        />
      </div>

      {/* 3. Separate Bottom Floating Action Dock */}
      <div className="px-3.5 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.25)] ring-1 ring-black/5 dark:ring-white/10 flex items-center justify-between gap-2 apple-transition animate-fade-in">
        {showConfirmClose ? (
          /* Confirmation Bar when Closing with Unsaved Changes */
          <div className="w-full flex items-center justify-between gap-2 px-1">
            <span className="text-xs font-semibold text-[var(--text-muted)] pl-2">Save changes?</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleDiscard}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-red-500 hover:bg-red-500/10 text-xs font-bold apple-transition apple-active-scale"
                title="Discard Changes"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Discard</span>
              </button>
              <button
                type="button"
                onClick={handleSaveDraft}
                className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[var(--bg-secondary)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-bold border border-[var(--card-border)] apple-transition apple-active-scale"
                title="Save as Draft"
              >
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                <span>Save as draft</span>
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmClose(false)}
                className="px-2.5 py-1.5 rounded-full text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--bg-color)] apple-transition"
                title="Keep editing"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* Normal State: Attach Button + Sensitive Word Chips + iMessage Send Button */
          <>
            {/* Hidden Native File Input */}
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleAttachFiles}
              className="hidden"
            />

            {/* Left: Paperclip / Attach File Action */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-blue-500 hover:bg-[var(--bg-color)] apple-transition apple-active-scale shrink-0"
              title="Attach photos or files"
            >
              <Paperclip className="w-4 h-4 stroke-[2.2]" />
            </button>

            {/* Center: Dynamic Single-Word Autocompletions */}
            <div className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 min-w-0">
              {wordSuggestions.map((word, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => insertWord(word)}
                  className="px-3 py-1 rounded-full bg-[var(--bg-color)] hover:bg-[var(--accent-blue-light)] hover:text-[var(--accent-blue)] text-[var(--text-secondary)] text-[11px] font-bold border border-[var(--card-border)] whitespace-nowrap truncate max-w-[140px] apple-transition active:scale-95 shrink-0 shadow-2xs"
                  title={`Insert "${word}"`}
                >
                  {word}
                </button>
              ))}
            </div>

            {/* Right: Iconic iMessage Blue Circular Upward Arrow Send Button */}
            <div className="shrink-0 pr-0.5">
              <button
                type="button"
                onClick={handleSend}
                disabled={isSending || (recipients.length === 0 && !inputValue.trim())}
                className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed apple-transition apple-active-scale group"
                title="Send Message"
              >
                {isSending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ArrowUp className="w-4 h-4 stroke-[3] group-hover:-translate-y-0.5 apple-transition" />
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
    </>
  );
};
