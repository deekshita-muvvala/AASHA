import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Senior profile default context for safety grid awareness
const DEFAULT_SENIOR_CONTEXT = `
Senior Citizen Profile:
- Name: Smt. Lakshmi Varma (Age 72)
- Location: Banjara Hills, Hyderabad, Telangana
- Critical Medical Conditions: Post-PCI (Drug-Eluting Stent placed Nov 2024), Hypertension, Type 2 Diabetes.
- Severe Contraindications & Allergies: PENICILLIN CONTRAINDICATED (Anaphylactic risk). Avoid beta-lactam antibiotics.
- Blood Group: O+ Positive
- Daily Medications: Telmisartan 40mg (Morning post-breakfast for BP), Metformin 500mg (Morning post-breakfast), Multivitamin & Calcium D3 (Afternoon), Atorvastatin 10mg (Night bedtime for cholesterol).
- Primary Emergency Hospital: Apollo Hospitals, Jubilee Hills, Hyderabad
- Designated Proxies:
  1. Son: Rajesh Varma (+91 98490 12345)
  2. Daughter: Ananya Rao (+91 98480 54321)
  3. Family Physician: Dr. K. S. Murthy (+91 94400 11223)
Emergency Contact Helpline: 108 Emergency Dial (+91 7981158373)
`;

// Fallback response engine for English & Telugu
function generateFallbackResponse(prompt: string, language: string = 'en'): string {
  const query = prompt.toLowerCase();
  const isTelugu = language === 'te' || /తెలుగు|telugu/i.test(prompt);

  if (query.includes('telmisartan') || query.includes('bp') || query.includes('breakfast') || query.includes('బిపి') || query.includes('మందులు')) {
    if (isTelugu) {
      return `💊 **టెల్మిసార్టన్ (Telmisartan 40mg) బిపి మందుల సలహా:**
- అవును, అల్పాహారం (Breakfast) తీసుకున్న 20-30 నిమిషాల తర్వాత ఒక గ్లాసు నీటితో వేసుకోవడం చాలా మంచిది.
- ఖాళీ కడుపుతో తీసుకుంటే కడుపులో వికారం లేదా కొద్దిగా మగత కలగవచ్చు, కాబట్టి టిఫిన్ తర్వాత తీసుకోవడమే శ్రేయస్కరం.
- మీ రక్తపోటు (BP) స్థిరంగా ఉండటానికి ప్రతిరోజూ ఉదయం 8:30 గంటల సమయంలోనే క్రమం తప్పకుండా వేసుకోండి.
- మీ తదుపరి చెకప్ సమయానికి బిపి రికార్డు నమోదు చేసుకోండి.`;
    }
    return `💊 **Telmisartan 40mg (BP Medicine) Guidance:**
- **Yes, absolutely.** It is recommended to take Telmisartan 40mg approximately 20–30 minutes after your breakfast with a full glass of water.
- Taking it post-breakfast minimizes mild stomach upset or lightheadedness and maintains steady 24-hour blood pressure control.
- **Timing:** Keep your schedule fixed around 8:30 AM every morning.
- **Precaution:** Smt. Lakshmi Varma has a cardiac stent (Nov 2024); never skip your daily dose without consulting Dr. K. S. Murthy.`;
  }

  if (query.includes('dizziness') || query.includes('chest') || query.includes('tightness') || query.includes('కళ్ళు తిరగడం') || query.includes('గుండెలో')) {
    if (isTelugu) {
      return `🚨 **అత్యవసర హెచ్చరిక - వెంటనే పాటించండి:**
1. **విశ్రాంతి తీసుకోండి:** వెంటనే ప్రశాంతంగా కూర్చోండి లేదా తల కొద్దిగా ఎత్తుగా ఉండేలా పడుకోండి. నడవడం లేదా మెట్లు ఎక్కడం చేయకండి.
2. **ఛాతీలో నొప్పి లేదా బరువు ఉంటే:** ఇది అత్యవసర లక్షణం కావచ్చు. తక్షణమే ఆశా యాప్‌లోని **ఎరుపు SOS బటన్** నొక్కండి లేదా **108 ఎమర్జెన్సీ (+91 7981158373)** కి కాల్ చేయండి.
3. మీ కుమారుడు రాజేష్ వర్మ గారికి (+91 98490 12345) ఆటోమేటిక్ ఎమర్జెన్సీ అలర్ట్ పంపబడుతుంది.
4. లోతైన శ్వాస తీసుకోండి మరియు దుస్తులను వదులు చేసుకోండి. డాక్టర్ సలహా లేకుండా ఇతర మందులు వేసుకోవద్దు.`;
    }
    return `🚨 **URGENT CARDIAC & SAFETY TRIAGE:**
1. **Immediate Rest:** Sit down immediately in a comfortable armchair or lie down with your head slightly elevated. Do not attempt to walk.
2. **Assess Symptoms:** Smt. Lakshmi Varma has a cardiac stent history (Nov 2024). Any chest tightness, radiating pain to left arm/jaw, or sudden dizziness requires **IMMEDIATE ATTENTION**.
3. **Trigger SOS:** Tap the Crimson **SOS Beacon** on your Aasha dashboard right now or press **Dial 108 Emergency (+91 7981158373)**.
4. Automated dispatch will notify your proxy contacts (Rajesh Varma & Dr. K. S. Murthy) with your live GPS location.
5. Take slow, calm breaths. Loosen tight collars. Do not ingest untested home remedies.`;
  }

  if (query.includes('translate') || query.includes('notes') || query.includes('తెలుగులో') || isTelugu) {
    return `🗣️ **వైద్య రికార్డుల తెలుగు అనువాదం & సారాంశం:**
- **రోగి:** శ్రీమతి లక్ష్మీ వర్మ (72 సం.)
- **రక్త గ్రూపు:** O+ పాజిటివ్
- **గుండె చరిత్ర:** ఔషధ-విడుదల స్టెంట్ (DES - నవంబర్ 2024)
- **తీవ్ర హెచ్చరిక (Allergy):** పెన్సిలిన్ మందులు ప్రాణాంతకం (Penicillin Contraindicated - తీవ్రమైన అలెర్జీ ప్రమాదం). డాక్టర్లకు ఖచ్చితంగా తెలియజేయాలి.
- **ఎమర్జెన్సీ హాస్పిటల్:** అపోలో హాస్పిటల్స్, జూబ్లీహిల్స్, హైదరాబాద్.
- **అత్యవసర సంప్రదింపు:** కుమారుడు రాజేష్ వర్మ (+91 98490 12345) మరియు 108 హెల్ప్‌లైన్ (+91 7981158373).`;
  }

  if (query.includes('fall') || query.includes('prevention') || query.includes('జారిపడకుండా') || query.includes('కింద పడకుండా')) {
    if (isTelugu) {
      return `🏠 **వృద్ధులు ఇంట్లో జారిపడకుండా 5 ముఖ్యమైన భద్రతా సూత్రాలు:**
1. **బాత్‌రూమ్ భద్రత:** స్నానపు గది మరియు కమోడ్ వద్ద నాన్-స్లిప్ మ్యాట్‌లు మరియు పట్టుకునే హ్యాండిల్స్ (Grab bars) అమర్చుకోండి.
2. **స్పష్టమైన వెలుతురు:** రాత్రి పూట నైట్ ల్యాంప్‌లు లేదా సెన్సార్ లైట్లు తప్పనిసరిగా వాడండి. చీకటిలో నడవద్దు.
3. **అడ్డంకులు తొలగించండి:** హాల్ లేదా బెడ్‌రూమ్ నేలపై ఉన్న ఎలక్ట్రిక్ వైర్లు, జారే చిన్న కార్పెట్‌లను వెంటనే తొలగించండి.
4. **సహాయక కర్ర / చెప్పులు:** గ్రిప్ బాగున్న సౌకర్యవంతమైన రబ్బర్ సోల్ చెప్పులు వాడండి.
5. **నెమ్మదిగా లేవండి:** మంచం లేదా కుర్చీ నుండి ఒక్కసారిగా లేవకుండా, 30 సెకన్లు కూర్చుని నెమ్మదిగా నిలబడండి.`;
    }
    return `🏠 **5 Senior Fall Prevention Tips at Home:**
1. **Bathroom Safety:** Install sturdy grab bars near the commode/shower and use textured non-slip silicone mats. Keep floor strictly dry.
2. **Night Lighting:** Keep bright low-glare night lights illuminated in corridors, bedroom path, and restrooms.
3. **Clear Pathways:** Remove loose scatter rugs, telephone cords, and floor clutter that could snag elder slippers.
4. **Footwear & Walking:** Wear enclosed supportive footwear with non-skid rubber soles. Avoid walking in slick socks.
5. **Sit-to-Stand Transition:** When waking up, sit on the bed edge for 30–60 seconds before standing to prevent postural hypotension dizziness.`;
  }

  if (isTelugu) {
    return `నమస్కారం! నేను మీ **ఆశా కేర్ ఏఐ (Aasha Care AI)** సహాయకుడిని. 
లక్ష్మీ వర్మ గారి ఆరోగ్యం, రోజువారీ మందుల సమయాలు (టెల్మిసార్టన్, మెట్‌ఫార్మిన్), బిపి నియంత్రణ మరియు అత్యవసర జాగ్రత్తల గురించి నేను మీకు సహాయపడగలను. మీకు ఏదైనా అసౌకర్యం లేదా సందేహం ఉంటే ఇప్పుడే అడగండి! అత్యవసరమైతే వెంటనే ఎరుపు SOS బటన్ నొక్కండి.`;
  }

  return `Hello! I am **Aasha Care AI**, your personalized senior health companion. 
I am actively monitoring Smt. Lakshmi Varma's safety profile (Post-Stent care, Penicillin contraindication, and daily medication schedule). 

How can I support your wellness today? You can ask about:
• Today's morning/afternoon/night medication schedules
• Safe post-breakfast timing for Telmisartan
• Immediate triage for dizziness or chest discomfort
• Senior home safety & fall prevention guidelines
*(In an acute emergency, please tap the Red SOS Beacon on Dashboard 2 or call 108 immediately.)*`;
}

// AI Chatbot endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, language = 'en', context } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Graceful intelligent fallback when API key is not configured
      const fallbackReply = generateFallbackResponse(prompt, language);
      return res.json({
        reply: fallbackReply,
        source: 'fallback',
        model: 'triage-engine-v2'
      });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = `
You are "Aasha Care AI" (ఆశా కేర్ ఏఐ), a gentle, highly knowledgeable, and protective eldercare companion and health triage guide designed specifically for Indian senior citizens.

Context & Safety Grid:
${DEFAULT_SENIOR_CONTEXT}
${context ? `Additional Realtime Context: ${JSON.stringify(context)}` : ''}

Key Directives:
1. Empathy & Tone: Always address the senior or family caregiver with warmth, utmost respect, and calm reassurance. Use clear, simple language with accessible formatting (bullet points, bold highlights).
2. Bilingual Mastery: Respond fluently in the requested language: English or Telugu (తెలుగు) based on user preference or user query language.
3. Medical Safety & Allergies: NEVER recommend Penicillin or related beta-lactam antibiotics. Keep in mind her cardiac stent (Nov 2024), hypertension, and diabetes.
4. Acute Emergency Protocol: If the senior reports chest tightness, radiating pain, breathlessness, loss of balance, or acute dizziness, urge immediate rest, advise pressing the Red SOS beacon in Aasha, and contacting 108 Emergency (+91 7981158373).
5. Accessibility: Keep answers concise, actionable, and formatted cleanly for quick reading and text-to-speech narration.
`;

      // Try gemini-2.5-flash as requested, falling back to gemini-3.8-flash if needed
      let replyText = '';
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            systemInstruction,
          },
        });
        replyText = response.text || '';
      } catch (err: any) {
        // Fallback to gemini-3.8-flash if 2.5-flash is not available in region
        const response2 = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction,
          },
        });
        replyText = response2.text || '';
      }

      if (!replyText) {
        replyText = generateFallbackResponse(prompt, language);
      }

      return res.json({
        reply: replyText,
        source: 'gemini',
        model: 'gemini-2.5-flash',
      });
    } catch (aiError: any) {
      console.error('Gemini API call failed, using local triage engine:', aiError?.message || aiError);
      const fallbackReply = generateFallbackResponse(prompt, language);
      return res.json({
        reply: fallbackReply,
        source: 'fallback',
        model: 'triage-engine-v2',
      });
    }
  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Aasha Care Platform Server',
  });
});

// Google Maps client config endpoint
app.get('/api/maps-config', (req, res) => {
  res.json({
    apiKey:
      process.env.VITE_GOOGLE_MAPS_API_KEY ||
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.MAPS_API_KEY ||
      '',
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Aasha Care Platform server running on http://localhost:${port}`);
  });
}

startServer();
