// ========================================
// Internationalization (i18n) Module
// Supports: English (en), Thai (th)
// ========================================

const i18n = {
  currentLang: localStorage.getItem('sd-lang') || 'en',

  translations: {
    // Navigation
    'nav.home': { en: 'Home', th: 'หน้าแรก' },
    'nav.chapters': { en: 'Chapters', th: 'บทเรียน' },
    'nav.about': { en: 'About', th: 'เกี่ยวกับ' },
    'nav.references': { en: 'References', th: 'อ้างอิง' },

    // Hero
    'hero.title': { en: 'Seeing Systems', th: 'มองเห็นระบบ' },
    'hero.subtitle': {
      en: 'A visual introduction to System Dynamics Modeling',
      th: 'บทนำสู่การสร้างแบบจำลองพลวัตระบบแบบเห็นภาพ'
    },
    'hero.start': { en: 'Start', th: 'เริ่มเลย' },

    // Chapter titles
    'ch1.label': { en: 'Chapter 1', th: 'บทที่ 1' },
    'ch1.title': { en: 'Thinking in Systems', th: 'การคิดเชิงระบบ' },
    'ch1.desc': {
      en: 'Understand what systems are, how stocks, flows, and feedback loops work, and why complex systems behave in counterintuitive ways.',
      th: 'ทำความเข้าใจว่าระบบคืออะไร สต็อก กระแส และวงจรป้อนกลับทำงานอย่างไร และทำไมระบบที่ซับซ้อนถึงมีพฤติกรรมที่ขัดกับสัญชาตญาณ'
    },

    'ch2.label': { en: 'Chapter 2', th: 'บทที่ 2' },
    'ch2.title': { en: 'SD: The Language of Feedback', th: 'พลวัตระบบ: ภาษาของวงจรป้อนกลับ' },
    'ch2.desc': {
      en: 'Master the tools and language of System Dynamics — stock-flow diagrams, behavior patterns, system archetypes, and leverage points.',
      th: 'เรียนรู้เครื่องมือหลักของพลวัตระบบ — แผนภาพสต็อก-โฟลว์ รูปแบบพฤติกรรม กับดักของระบบ และจุดงัด'
    },

    'ch3.label': { en: 'Chapter 3', th: 'บทที่ 3' },
    'ch3.title': { en: 'SD for Economics', th: 'พลวัตระบบสำหรับเศรษฐศาสตร์' },
    'ch3.desc': {
      en: 'Apply System Dynamics to economic modeling — Minsky cycles, debt dynamics, disequilibrium economics, and financial crisis prediction.',
      th: 'ประยุกต์พลวัตระบบกับการสร้างแบบจำลองเศรษฐกิจ — วัฏจักร Minsky พลวัตหนี้ เศรษฐศาสตร์ไม่สมดุล และการพยากรณ์วิกฤตการเงิน'
    },

    'ch4.label': { en: 'Chapter 4', th: 'บทที่ 4' },
    'ch4.title': { en: 'ABM: Thinking from the Bottom Up', th: 'ABM: คิดจากล่างขึ้นบน' },
    'ch4.desc': {
      en: 'Discover Agent-Based Modeling — how simple agent rules create complex emergent patterns in economies and societies.',
      th: 'ค้นพบการสร้างแบบจำลองเชิงตัวแทน — กฎง่ายๆ ของตัวแทนสร้างรูปแบบที่ซับซ้อนในระบบเศรษฐกิจและสังคมได้อย่างไร'
    },

    'ch5.label': { en: 'Chapter 5', th: 'บทที่ 5' },
    'ch5.title': { en: 'Agent-Based Computational Economics', th: 'เศรษฐศาสตร์เชิงคำนวณแบบตัวแทน' },
    'ch5.desc': {
      en: 'Explore ACE — building economic models from the ground up with autonomous, learning agents that discover prices, form markets, and create institutions.',
      th: 'สำรวจ ACE — การสร้างแบบจำลองเศรษฐกิจจากล่างขึ้นบนด้วยตัวแทนอัตโนมัติที่เรียนรู้ ค้นหาราคา สร้างตลาด และก่อตั้งสถาบัน'
    },

    'ch6.label': { en: 'Chapter 6', th: 'บทที่ 6' },
    'ch6.title': { en: 'Hybrid SD+ABM Modeling', th: 'แบบจำลองแบบผสม SD+ABM' },
    'ch6.desc': {
      en: 'Learn how to combine System Dynamics (top-down) and Agent-Based Modeling (bottom-up) for comprehensive simulation frameworks.',
      th: 'เรียนรู้การผสมผสานพลวัตระบบ (บนลงล่าง) กับแบบจำลองเชิงตัวแทน (ล่างขึ้นบน) เพื่อกรอบการจำลองที่ครอบคลุม'
    },

    'ch7.label': { en: 'Chapter 7', th: 'บทที่ 7' },
    'ch7.title': { en: 'Policy Applications', th: 'การประยุกต์ใช้นโยบาย' },
    'ch7.desc': {
      en: 'Apply simulation models to real-world policy evaluation — tobacco control, tax modeling, and public health impact in Thailand.',
      th: 'ประยุกต์แบบจำลองกับการประเมินนโยบายจริง — การควบคุมยาสูบ แบบจำลองภาษี และผลกระทบสาธารณสุขในประเทศไทย'
    },

    'ch8.label': { en: 'Chapter 8', th: 'บทที่ 8' },
    'ch8.title': { en: 'Building Your Own Models', th: 'สร้างแบบจำลองของคุณเอง' },
    'ch8.desc': {
      en: 'Learn the complete modeling process — from problem articulation to policy design — and start building your own SD, ABM, or hybrid models.',
      th: 'เรียนรู้กระบวนการสร้างแบบจำลองทั้งหมด — จากการกำหนดปัญหาสู่การออกแบบนโยบาย — และเริ่มสร้างแบบจำลอง SD, ABM หรือแบบผสมของคุณเอง'
    },

    // Chapter 1 content
    'ch1.intro.title': { en: 'What is System Dynamics?', th: 'พลวัตระบบคืออะไร?' },
    'ch1.intro.p1': {
      en: 'System Dynamics is a methodology for understanding how complex systems change over time. Founded by Jay W. Forrester at MIT in the 1950s, it uses computer simulation to reveal how the structure of a system—its feedback loops, delays, and nonlinearities—determines its behavior.',
      th: 'พลวัตระบบเป็นวิธีการทำความเข้าใจว่าระบบที่ซับซ้อนเปลี่ยนแปลงอย่างไรตามเวลา ก่อตั้งโดย Jay W. Forrester ที่ MIT ในทศวรรษ 1950 โดยใช้การจำลองด้วยคอมพิวเตอร์เพื่อเผยให้เห็นว่าโครงสร้างของระบบ—วงจรป้อนกลับ ความล่าช้า และความไม่เป็นเชิงเส้น—กำหนดพฤติกรรมของระบบอย่างไร'
    },
    'ch1.intro.p2': {
      en: 'Unlike traditional approaches that break problems into isolated parts, System Dynamics looks at the whole system and how its parts interact to create patterns of behavior over time.',
      th: 'ต่างจากวิธีดั้งเดิมที่แยกปัญหาออกเป็นส่วนๆ พลวัตระบบมองภาพรวมของระบบทั้งหมดและว่าส่วนต่างๆ มีปฏิสัมพันธ์กันสร้างรูปแบบพฤติกรรมตามเวลาอย่างไร'
    },

    'ch1.counterintuitive.title': { en: 'Counterintuitive Behavior', th: 'พฤติกรรมที่ขัดสัญชาตญาณ' },
    'ch1.counterintuitive.p1': {
      en: 'One of the most important insights from System Dynamics is that complex systems often behave in ways that are counterintuitive. As Forrester (1971) observed, policies designed to fix social problems frequently make them worse.',
      th: 'หนึ่งในข้อค้นพบที่สำคัญที่สุดจากพลวัตระบบคือ ระบบที่ซับซ้อนมักมีพฤติกรรมที่ขัดกับสัญชาตญาณ ดังที่ Forrester (1971) สังเกต นโยบายที่ออกแบบมาเพื่อแก้ปัญหาสังคมมักทำให้ปัญหาแย่ลง'
    },
    'ch1.counterintuitive.p2': {
      en: 'Try the simulation below: you are managing a city\'s population. Use the sliders to set policies and see how the system responds—often in unexpected ways!',
      th: 'ลองจำลองด้านล่าง: คุณกำลังบริหารประชากรเมือง ใช้สไลเดอร์ตั้งค่านโยบายและดูว่าระบบตอบสนองอย่างไร—มักจะเป็นแบบที่คาดไม่ถึง!'
    },

    'ch1.mental.title': { en: 'Mental Models & System Thinking', th: 'แบบจำลองทางจิตและการคิดเชิงระบบ' },
    'ch1.mental.p1': {
      en: 'Every decision we make is based on mental models—our internal pictures of how the world works. System Dynamics makes these mental models explicit through diagrams and equations, allowing us to test our assumptions with simulation.',
      th: 'ทุกการตัดสินใจของเราขึ้นอยู่กับแบบจำลองทางจิต—ภาพในใจของเราว่าโลกทำงานอย่างไร พลวัตระบบทำให้แบบจำลองทางจิตเหล่านี้ชัดเจนผ่านแผนภาพและสมการ ช่วยให้เราทดสอบสมมติฐานด้วยการจำลอง'
    },
    'ch1.mental.p2': {
      en: 'As Sterman (2000) argues, "the most important thing we can do is improve the mental models of decision makers." Click on the diagram elements below to explore how a simple causal loop works.',
      th: 'ดังที่ Sterman (2000) โต้แย้ง "สิ่งสำคัญที่สุดที่เราทำได้คือปรับปรุงแบบจำลองทางจิตของผู้ตัดสินใจ" คลิกที่องค์ประกอบในแผนภาพด้านล่างเพื่อสำรวจว่าวงจรเหตุ-ผลอย่างง่ายทำงานอย่างไร'
    },

    // Interactive labels
    'interactive.population': { en: 'Population Simulation', th: 'จำลองประชากร' },
    'interactive.housing': { en: 'Housing Investment', th: 'การลงทุนด้านที่อยู่อาศัย' },
    'interactive.jobs': { en: 'Job Creation Programs', th: 'โปรแกรมสร้างงาน' },
    'interactive.run': { en: 'Run Simulation', th: 'เริ่มจำลอง' },
    'interactive.reset': { en: 'Reset', th: 'รีเซ็ต' },
    'interactive.population.label': { en: 'Population', th: 'ประชากร' },
    'interactive.attractiveness': { en: 'City Attractiveness', th: 'ความน่าสนใจของเมือง' },
    'interactive.time': { en: 'Time (years)', th: 'เวลา (ปี)' },
    'interactive.causal': { en: 'Causal Loop Diagram', th: 'แผนภาพวงจรเหตุ-ผล' },
    'interactive.click_node': { en: 'Click on any node to learn more', th: 'คลิกที่โหนดใดก็ได้เพื่อเรียนรู้เพิ่มเติม' },

    // Footer
    'footer.text': {
      en: 'Built for learning System Dynamics. Content synthesized from academic research.',
      th: 'สร้างเพื่อการเรียนรู้พลวัตระบบ เนื้อหาสังเคราะห์จากงานวิจัยเชิงวิชาการ'
    },

    // Coming soon
    'coming_soon': { en: 'Coming Soon', th: 'เร็วๆ นี้' },
  },

  t(key) {
    const entry = this.translations[key];
    if (!entry) return key;
    return entry[this.currentLang] || entry['en'] || key;
  },

  setLang(lang) {
    this.currentLang = lang;
    localStorage.setItem('sd-lang', lang);
    this.updatePage();
  },

  updatePage() {
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = this.t(key);
    });

    // Update all elements with data-i18n-html attribute (for HTML content)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      el.innerHTML = this.t(key);
    });

    // Update elements with inline data-i18n-en / data-i18n-th attributes
    document.querySelectorAll('[data-i18n-en]').forEach(el => {
      const text = el.getAttribute(`data-i18n-${this.currentLang}`) || el.getAttribute('data-i18n-en');
      if (text) {
        if (text.includes('<')) el.innerHTML = text;
        else el.textContent = text;
      }
    });

    // Update language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === this.currentLang);
    });

    // Update html lang attribute
    document.documentElement.lang = this.currentLang;
  },

  init() {
    // Set up language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setLang(btn.dataset.lang);
      });
    });
    this.updatePage();
  }
};

document.addEventListener('DOMContentLoaded', () => i18n.init());
