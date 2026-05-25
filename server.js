const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==================== CONFIG ====================
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-014a5bf3070a4e08a689330c487de5cb';
const API_URL = 'https://api.deepseek.com/v1/chat/completions';
const MODEL = 'deepseek-chat';

// ==================== AI CHAT ENDPOINT ====================
app.post('/api/chat', async (req, res) => {
  const { messages, scenario, level } = req.body;

  if (!DEEPSEEK_API_KEY) {
    return res.json({ reply: getMockReply(scenario, messages) });
  }

  try {
    const systemPrompt = getChatSystemPrompt(scenario, level);

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + DEEPSEEK_API_KEY
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 300,
        temperature: 0.85,
        messages: apiMessages
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('API error:', err);
      return res.status(500).json({ error: 'API请求失败', reply: getMockReply(scenario, messages) });
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;
    res.json({ reply });
  } catch (e) {
    console.error('Chat error:', e);
    res.json({ reply: getMockReply(scenario, messages) });
  }
});

function getChatSystemPrompt(scenario, level) {
  const levelGuide = level === 'beginner'
    ? 'Use simple vocabulary and short sentences. Explain any slang you use in parentheses with Chinese translation. Speak slowly and clearly in tone.'
    : level === 'intermediate'
    ? 'Use everyday English with common slang and idioms. Keep it natural but not too fast. Occasionally explain tricky expressions.'
    : 'Use full native-speed English with abundant slang, idioms, phrasal verbs, and cultural references. Do NOT explain slang unless asked — act like a real native speaker.';

  return `You are a friendly native English speaker (American) chatting with a Chinese learner. Your name is Alex.

CURRENT SCENARIO: ${scenario}

RULES:
- Stay in character for the scenario "(${scenario})"
- ${levelGuide}
- Keep responses short (2-4 sentences max)
- Use natural spoken English with contractions (gonna, wanna, gotta, y'know, kinda, ain't, etc.)
- Use appropriate emotional tone — excited, casual, sympathetic, whatever fits the situation
- Occasionally throw in a new slang expression naturally
- React to what the user says and keep the conversation flowing
- When the user makes a grammar mistake, gently correct them by rephrasing correctly in your response
- Always be encouraging and supportive — this is a language learning conversation`;
}

function getMockReply(scenario, messages) {
  // Mock replies when no API key — still useful for practice
  const lastMsg = messages.length > 0 ? messages[messages.length - 1].content.toLowerCase() : '';
  const mockReplies = {
    default: [
      "Oh nice! So tell me more about that — I'm curious now!",
      "Haha I feel you! That's so real honestly. 😄",
      "Wait, for real? That's interesting! What happened next?",
      "Hmm that's a good point. What do you think about it though?",
      "No way! You're kidding, right? Tell me more!",
      "Yeah I totally get that. Same here honestly.",
      "Ohh I see what you mean. So how did that turn out?",
    ],
    greeting: [
      "Hey hey! Good to see you! How's your day going so far?",
      "Hey there! What's good? How you been?",
      "Yo! Long time! What's new with you?",
    ],
    food: [
      "Oh man, you're making me hungry! What's your go-to comfort food?",
      "Nice choice! I'm a big foodie myself. Ever tried [insert local dish]?",
      "Yum! So are you more of a sweet or savory person?",
    ],
    travel: [
      "That sounds amazing! I've always wanted to go there. What's the vibe like?",
      "Oh cool! So are you a plan-everything traveler or more of a go-with-the-flow type?",
      "Nice! Any culture shocks or funny stories from your trip?",
    ],
    work: [
      "Ugh, tell me about it. Work's been crazy on my end too.",
      "Hey that's a great way to look at it. So what do you do exactly?",
      "I feel that. You gotta find that work-life balance, y'know?",
    ]
  };

  let category = 'default';
  if (messages.length <= 1) category = 'greeting';
  else if (lastMsg.includes('food') || lastMsg.includes('eat') || lastMsg.includes('restaurant')) category = 'food';
  else if (lastMsg.includes('travel') || lastMsg.includes('trip') || lastMsg.includes('visit')) category = 'travel';
  else if (lastMsg.includes('work') || lastMsg.includes('job') || lastMsg.includes('office')) category = 'work';

  const replies = mockReplies[category] || mockReplies.default;
  return replies[Math.floor(Math.random() * replies.length)];
}

// ==================== IELTS ENDPOINTS ====================
// Large built-in IELTS question bank
const ieltsQuestions = {
  speaking: {
    part1: [
      { topic: "Work & Study", questions: [
        "Do you work or are you a student?",
        "What do you like most about your job/studies?",
        "Would you recommend your job/field to others? Why or why not?",
        "Do you prefer working alone or in a team?",
        "What kind of work do you want to do in the future?",
      ]},
      { topic: "Hometown", questions: [
        "Tell me about your hometown.",
        "What's the most interesting part of your hometown?",
        "Has your hometown changed much in recent years?",
        "Do you think you'll continue living there?",
        "What's public transport like in your hometown?",
      ]},
      { topic: "Home & Accommodation", questions: [
        "What kind of place do you live in?",
        "What's your favorite room in your home?",
        "How long have you lived there?",
        "What would you change about your home?",
        "Do you know your neighbors well?",
      ]},
      { topic: "Daily Routine", questions: [
        "What's your typical daily routine?",
        "What's your favorite time of day? Why?",
        "Has your routine changed much compared to a few years ago?",
        "Do you prefer to plan your day or be spontaneous?",
        "What would your ideal morning look like?",
      ]},
      { topic: "Hobbies & Free Time", questions: [
        "What do you like to do in your free time?",
        "Do you prefer indoor or outdoor activities?",
        "Has your hobby changed since you were a child?",
        "Is there a new hobby you'd like to take up?",
        "Do you think having a hobby is important? Why?",
      ]},
      { topic: "Technology", questions: [
        "How often do you use technology in your daily life?",
        "What's your favorite piece of technology?",
        "Do you think people rely too much on technology?",
        "How has technology changed the way we communicate?",
        "What new technology excites you the most?",
      ]},
      { topic: "Food & Cooking", questions: [
        "What kind of food do you enjoy eating?",
        "Do you enjoy cooking? Why or why not?",
        "What's a traditional dish from your country?",
        "Has your diet changed in recent years?",
        "Do you prefer eating at home or dining out?",
      ]},
      { topic: "Weather & Seasons", questions: [
        "What's the weather like in your country?",
        "What's your favorite season? Why?",
        "Does the weather affect your mood?",
        "What outdoor activities are popular in different seasons where you live?",
        "Has the climate changed noticeably in your lifetime?",
      ]},
      { topic: "Sports & Exercise", questions: [
        "Do you do any sports or exercise?",
        "What sports are popular in your country?",
        "Did you play sports as a child?",
        "Do you prefer watching sports live or on TV?",
        "What do you think about extreme sports?",
      ]},
      { topic: "Music & Arts", questions: [
        "What kind of music do you enjoy listening to?",
        "Do you play any musical instruments?",
        "Have you ever been to a live concert?",
        "Do you think arts education is important in schools?",
        "How has the way people consume music changed?",
      ]},
      { topic: "Travel & Holidays", questions: [
        "Do you enjoy traveling?",
        "Where did you go on your last holiday?",
        "What's your dream travel destination?",
        "Do you prefer traveling alone or with others?",
        "How do you usually plan your trips?",
      ]},
      { topic: "Shopping", questions: [
        "Do you enjoy shopping?",
        "Do you prefer shopping online or in physical stores?",
        "What do you usually spend the most money on?",
        "Have your shopping habits changed in recent years?",
        "What's the last thing you bought that you really liked?",
      ]},
    ],
    part2: [
      { topic: "Describe a memorable trip you took", cues: ["Where you went", "Who you went with", "What you did", "Why it was memorable"] },
      { topic: "Describe a person who influenced you greatly", cues: ["Who this person is", "How you know them", "What they did", "How they influenced you"] },
      { topic: "Describe a book that had a big impact on you", cues: ["What the book is", "When you read it", "What it is about", "Why it had an impact"] },
      { topic: "Describe a skill you would like to learn", cues: ["What the skill is", "Why you want to learn it", "How you would learn it", "How it would benefit you"] },
      { topic: "Describe a time you helped someone", cues: ["Who you helped", "What the situation was", "How you helped", "How you felt about it"] },
      { topic: "Describe a gift you gave someone", cues: ["What the gift was", "Who you gave it to", "Why you chose that gift", "How the person reacted"] },
      { topic: "Describe a traditional celebration in your country", cues: ["What the celebration is", "When it takes place", "What people do", "Why it is important"] },
      { topic: "Describe a piece of technology you find useful", cues: ["What it is", "When you first used it", "What you use it for", "Why it is useful"] },
      { topic: "Describe a restaurant you enjoy visiting", cues: ["Where it is", "What kind of food it serves", "How often you go", "Why you like it"] },
      { topic: "Describe an achievement you are proud of", cues: ["What the achievement was", "When it happened", "What you did", "Why you are proud of it"] },
      { topic: "Describe a place in nature you enjoy", cues: ["Where it is", "What it looks like", "What you do there", "Why you enjoy it"] },
      { topic: "Describe a time you tried something new", cues: ["What you tried", "When and where", "Why you tried it", "How you felt about it"] },
      { topic: "Describe your ideal house or apartment", cues: ["Where it would be", "What it would look like", "What rooms it would have", "Why it would be ideal"] },
      { topic: "Describe a film or TV show that made you think", cues: ["What it is", "When you watched it", "What it is about", "Why it made you think"] },
      { topic: "Describe a good decision you made recently", cues: ["What the decision was", "When you made it", "Why you made it", "How it turned out"] },
    ],
    part3: [
      { topic: "Education", questions: [
        "What's the purpose of education in modern society?",
        "Should universities focus more on practical skills or theoretical knowledge?",
        "How has technology changed education in recent years?",
        "Do you think standardized testing is an effective way to assess students?",
        "What role should teachers play in the age of AI and online learning?",
      ]},
      { topic: "Environment", questions: [
        "What are the biggest environmental challenges facing the world today?",
        "Whose responsibility is it to protect the environment — individuals or governments?",
        "How can businesses balance economic growth with environmental protection?",
        "Do you think enough is being done to combat climate change?",
        "What changes can ordinary people make to help the environment?",
      ]},
      { topic: "Technology & Society", questions: [
        "How has social media changed the way people interact?",
        "Do you think artificial intelligence will create more jobs than it destroys?",
        "Should there be limits on technological development?",
        "How has smartphone usage affected family relationships?",
        "What skills will be most important in the future job market?",
      ]},
      { topic: "Culture & Tradition", questions: [
        "How important is it to preserve traditional customs?",
        "How has globalization affected local cultures?",
        "Should children be taught traditional values at home or at school?",
        "Is it possible for traditional and modern lifestyles to coexist?",
        "What cultural traditions in your country are at risk of disappearing?",
      ]},
      { topic: "Health & Wellbeing", questions: [
        "What are the main causes of stress in modern life?",
        "Should governments do more to promote healthy lifestyles?",
        "How has the approach to mental health changed in recent years?",
        "What's more important for health — diet or exercise?",
        "How can workplaces better support employee wellbeing?",
      ]},
    ]
  },
  vocabulary: [
    { sentence: "The government has implemented new policies to ___ economic growth in rural areas.", options: ["stimulate", "simulate", "stipulate", "stagnate"], answer: "stimulate", tip: "stimulate = 刺激；激励" },
    { sentence: "The research findings have significant ___ for future medical treatments.", options: ["implications", "complications", "applications", "indications"], answer: "implications", tip: "implications = 影响；含义" },
    { sentence: "Many traditional crafts are at risk of becoming ___ as younger generations show less interest.", options: ["extinct", "distinct", "instinct", "extant"], answer: "extinct", tip: "extinct = 灭绝的；失传的" },
    { sentence: "The company's decision to expand overseas was a ___ move that paid off handsomely.", options: ["strategic", "dramatic", "erratic", "static"], answer: "strategic", tip: "strategic = 战略性的" },
    { sentence: "Climate change ___ a serious threat to global food security.", options: ["poses", "postures", "positions", "presumes"], answer: "poses", tip: "pose a threat = 构成威胁" },
    { sentence: "The professor's lecture was so ___ that even complex topics became easy to understand.", options: ["articulate", "artificial", "arbitrary", "ambiguous"], answer: "articulate", tip: "articulate = 表达清晰的" },
    { sentence: "Despite initial ___, the new system eventually proved to be highly effective.", options: ["skepticism", "optimism", "enthusiasm", "altruism"], answer: "skepticism", tip: "skepticism = 怀疑态度" },
    { sentence: "The country has seen ___ economic growth over the past decade, averaging 6% annually.", options: ["sustained", "contained", "restrained", "detained"], answer: "sustained", tip: "sustained = 持续的" },
    { sentence: "The two companies decided to ___ rather than compete, creating a stronger market presence.", options: ["collaborate", "elaborate", "corroborate", "deteriorate"], answer: "collaborate", tip: "collaborate = 合作" },
    { sentence: "Social media has ___ changed how people consume news and information.", options: ["fundamentally", "superficially", "marginally", "deliberately"], answer: "fundamentally", tip: "fundamentally = 根本性地" },
    { sentence: "The research team's findings ___ previous theories about climate patterns.", options: ["contradicted", "constricted", "constituted", "constructed"], answer: "contradicted", tip: "contradict = 与…矛盾；反驳" },
    { sentence: "Urban planners must ___ the needs of residents with environmental concerns.", options: ["balance", "calculate", "determine", "eliminate"], answer: "balance", tip: "balance = 平衡；权衡" },
    { sentence: "Renewable energy sources are becoming increasingly ___ as technology improves.", options: ["viable", "liable", "pliable", "amiable"], answer: "viable", tip: "viable = 可行的" },
    { sentence: "The author's ___ use of metaphor adds depth and richness to the narrative.", options: ["adept", "inept", "adapt", "adopt"], answer: "adept", tip: "adept = 熟练的；擅长的" },
    { sentence: "Governments worldwide are ___ with the challenges of aging populations.", options: ["grappling", "grasping", "grazing", "grading"], answer: "grappling", tip: "grapple with = 努力应对" },
    { sentence: "The rise of remote work has ___ the boundaries between professional and personal life.", options: ["blurred", "barred", "burred", "burned"], answer: "blurred", tip: "blur = 模糊（界限）" },
    { sentence: "International cooperation is ___ to addressing global challenges like climate change.", options: ["imperative", "comparative", "imperative", "imperial"], answer: "imperative", tip: "imperative = 至关重要的" },
    { sentence: "The museum's new exhibition aims to ___ visitors about the region's rich cultural heritage.", options: ["enlighten", "enliven", "enlist", "enforce"], answer: "enlighten", tip: "enlighten = 启发；启迪" },
    { sentence: "Economic inequality remains a ___ issue that policymakers continue to debate.", options: ["contentious", "conscientious", "contagious", "continuous"], answer: "contentious", tip: "contentious = 有争议的" },
    { sentence: "The rapid ___ of artificial intelligence raises important ethical questions.", options: ["proliferation", "prohibition", "preservation", "presentation"], answer: "proliferation", tip: "proliferation = 迅速发展；扩散" },
    { sentence: "The government's new ___ aims to reduce carbon emissions by 50% over the next decade.", options: ["initiative", "incentive", "imperative", "indicative"], answer: "initiative", tip: "initiative = 倡议；计划" },
    { sentence: "Effective communication skills are ___ in today's globalized workplace.", options: ["indispensable", "indistinguishable", "independent", "indifferent"], answer: "indispensable", tip: "indispensable = 不可或缺的" },
    { sentence: "The phenomenon of 'brain drain' has serious ___ for developing countries.", options: ["repercussions", "repetitions", "reparations", "replications"], answer: "repercussions", tip: "repercussions = 影响；后果" },
    { sentence: "Historical analysis shows that technological ___ often leads to social transformation.", options: ["innovation", "renovation", "initiation", "inspiration"], answer: "innovation", tip: "innovation = 创新" },
    { sentence: "Critics argue that the new law is too ___ and fails to address edge cases.", options: ["ambiguous", "ambitious", "amphibious", "ambivalent"], answer: "ambiguous", tip: "ambiguous = 模糊的；模棱两可的" },
  ],
  idioms: [
    { sentence: "The project was going well until we hit a major ___. Now everything is on hold.", options: ["setback", "comeback", "payback", "hatchback"], answer: "setback", tip: "setback = 挫折；障碍" },
    { sentence: "After months of preparation, the event went off without a ___.", options: ["hitch", "stitch", "pitch", "ditch"], answer: "hitch", tip: "without a hitch = 进展顺利" },
    { sentence: "She's been burning the ___ at both ends trying to finish her thesis and work part-time.", options: ["candle", "flame", "lamp", "torch"], answer: "candle", tip: "burn the candle at both ends = 过分消耗精力" },
    { sentence: "We need to think ___ the box if we want to solve this problem creatively.", options: ["outside", "inside", "around", "beyond"], answer: "outside", tip: "think outside the box = 跳出框框思考" },
    { sentence: "The new manager really hit the ___ running — she restructured the whole department in her first week.", options: ["ground", "floor", "road", "track"], answer: "ground", tip: "hit the ground running = 一开始就顺利运作" },
    { sentence: "I'm not sure which university to choose — I'm on the ___ right now.", options: ["fence", "edge", "border", "bridge"], answer: "fence", tip: "on the fence = 犹豫不决" },
    { sentence: "Getting that scholarship was a blessing in ___ — it forced me to study abroad and changed my life.", options: ["disguise", "disaster", "distress", "disdain"], answer: "disguise", tip: "a blessing in disguise = 因祸得福" },
    { sentence: "Learning a new language is a slow process — you have to learn to walk before you can ___.", options: ["run", "fly", "jump", "swim"], answer: "run", tip: "learn to walk before you can run = 循序渐进" },
    { sentence: "The exam results were a ___ call — I passed by just one point!", options: ["close", "near", "tight", "narrow"], answer: "close", tip: "a close call = 侥幸脱险；勉强过关" },
    { sentence: "Honestly, that new policy is just a ___ in the ocean — it won't make any real difference.", options: ["drop", "wave", "ripple", "splash"], answer: "drop", tip: "a drop in the ocean = 沧海一粟" },
    { sentence: "It's time to face the ___ — we can't keep avoiding this issue forever.", options: ["music", "facts", "truth", "reality"], answer: "music", tip: "face the music = 面对现实/承担后果" },
    { sentence: "He's been under the ___ lately because of the upcoming audit.", options: ["weather", "pressure", "radar", "cloud"], answer: "weather", tip: "under the weather = 身体不适" },
    { sentence: "The new restaurant is ___ and shoulders above the competition in terms of quality.", options: ["head", "hands", "feet", "neck"], answer: "head", tip: "head and shoulders above = 远远超过" },
    { sentence: "After years of hard work, her business finally started to bear ___.", options: ["fruit", "result", "profit", "growth"], answer: "fruit", tip: "bear fruit = 有成果；见成效" },
    { sentence: "Don't count your ___ before they hatch — the deal isn't signed yet.", options: ["chickens", "eggs", "ducks", "birds"], answer: "chickens", tip: "don't count your chickens before they hatch = 别高兴得太早" },
  ]
};

app.get('/api/ielts/speaking', (req, res) => {
  const { type, index } = req.query;
  let data;
  if (type === 'part1') {
    data = ieltsQuestions.speaking.part1;
  } else if (type === 'part2') {
    data = ieltsQuestions.speaking.part2;
  } else if (type === 'part3') {
    data = ieltsQuestions.speaking.part3;
  } else {
    data = ieltsQuestions.speaking.part1;
  }
  const i = index ? parseInt(index) % data.length : Math.floor(Math.random() * data.length);
  res.json({ item: data[i], total: data.length });
});

app.get('/api/ielts/vocab', (req, res) => {
  const count = parseInt(req.query.count) || 10;
  const shuffled = [...ieltsQuestions.vocabulary].sort(() => Math.random() - 0.5);
  res.json({ questions: shuffled.slice(0, count), total: ieltsQuestions.vocabulary.length });
});

app.get('/api/ielts/idioms', (req, res) => {
  const count = parseInt(req.query.count) || 10;
  const shuffled = [...ieltsQuestions.idioms].sort(() => Math.random() - 0.5);
  res.json({ questions: shuffled.slice(0, count), total: ieltsQuestions.idioms.length });
});

app.get('/api/ielts/topics', (req, res) => {
  const topics = ieltsQuestions.speaking.part1.map(p => p.topic);
  const part2Topics = ieltsQuestions.speaking.part2.map(p => p.topic);
  const part3Topics = ieltsQuestions.speaking.part3.map(p => p.topic);
  res.json({ part1: topics, part2: part2Topics, part3: part3Topics });
});

// ==================== HEALTH CHECK ====================
app.get('/api/status', (req, res) => {
  res.json({
    hasApiKey: !!DEEPSEEK_API_KEY,
    model: MODEL,
    provider: 'DeepSeek',
    message: DEEPSEEK_API_KEY ? 'AI对话已启用 (DeepSeek)' : '未配置API Key，使用内置模拟回复。'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server running at http://localhost:' + PORT);
  console.log('DeepSeek API Key configured: ' + !!DEEPSEEK_API_KEY);
});
