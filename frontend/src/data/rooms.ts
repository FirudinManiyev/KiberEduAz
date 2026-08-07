import type { Room } from "@/types/room";

export const rooms: Room[] = [
  {
    slug: "intro-to-pentesting",
    title: "Pentestinqə giriş",
    shortTitle: "Intro to Pentesting",
    eyebrow: "Qırmızı komanda · Room 01",
    description:
      "Pentestinqin əsaslarını, test növlərini, metodologiyanı və etik-hüquqi sərhədləri addım-addım öyrən.",
    path: "Red Team Path",
    module: "Pentestinqə giriş",
    category: "Hücum təhlükəsizliyi",
    type: "Walkthrough",
    difficulty: "Başlanğıc",
    duration: "45–60 dəq",
    points: 500,
    progress: 32,
    learners: 148,
    accent: "green",
    sourceFile: "intro_to_pentesting.md",
    objectives: [
      "Pentestinqi oxşar təhlükəsizlik yanaşmalarından fərqləndirmək",
      "Black, White və Grey Box test növlərini tanımaq",
      "Standart pentestinq metodologiyasını ardıcıllıqla izah etmək",
      "Scope, RoE və yazılı icazənin vacibliyini anlamaq",
    ],
    tasks: [
      {
        id: 1,
        title: "Pentestinq nədir?",
        duration: "8 dəq",
        sections: [
          {
            body: "Penetration testing — sistem, şəbəkə və ya tətbiqdəki zəiflikləri real hücumçu kimi düşünərək, ancaq əvvəlcədən verilmiş icazə və razılaşdırılmış sərhədlər daxilində aşkarlamaq prosesidir.",
          },
          {
            heading: "Məqsəd sadəcə zəiflik tapmaq deyil",
            body: "Pentester tapıntının real riskini göstərir, mümkün təsiri sübut edir və düzəliş üçün konkret tövsiyə hazırlayır. Hücumçudan əsas fərqi məqsəd deyil, hər şeydən əvvəl yazılı icazə və hüquqi çərçivədir.",
          },
          {
            heading: "Sadə analogiya",
            body: "Bank seyfinin davamlılığını yoxlamaq üçün peşəkar mütəxəssisə onu sınaqdan keçirməyə icazə verir. Mütəxəssis heç nə oğurlamır; haradan və necə daxil olmağın mümkün olduğunu hesabatda göstərir.",
          },
        ],
        question: {
          prompt: "Pentesteri real hücumçudan fərqləndirən əsas amil hansıdır?",
          options: [
            "Bilik səviyyəsi",
            "İcazə və hüquqi razılaşma",
            "İstifadə etdiyi alətlər",
            "İş saatları",
          ],
          correctAnswer: 1,
          explanation:
            "Pentester yalnız yazılı icazə və razılaşdırılmış scope daxilində işləyir. Eyni texniki addımlar icazəsiz olduqda qanunsuz sayılır.",
        },
      },
      {
        id: 2,
        title: "Oxşar anlayışlar",
        duration: "10 dəq",
        sections: [
          {
            body: "Təhlükəsizlik sahəsində eyni görünən yanaşmaların məqsədi və dərinliyi fərqlidir. Düzgün termin seçimi gözləntiləri və nəticəni aydınlaşdırır.",
            bullets: [
              "Vulnerability Assessment — məlum zəiflikləri aşkarlayır, adətən istismar etmir.",
              "Penetration Test — zəifliyin real təsirini nəzarətli şəkildə sübut edir.",
              "Red Teaming — insan, proses və texnologiyanın bütöv müdafiəsini sınayır.",
              "Bug Bounty — müstəqil tədqiqatçıların tapıntıya görə mükafat aldığı proqramdır.",
            ],
          },
          {
            heading: "Yadda saxla",
            body: "Zəiflik qiymətləndirməsi xəritəni çəkir; pentestinq seçilmiş yolların həqiqətən keçilə bildiyini yoxlayır.",
          },
        ],
        question: {
          prompt: "Zəiflikləri siyahıya alır, lakin onları istismar etmir. Bu hansı prosesdir?",
          options: [
            "Red Teaming",
            "Bug Bounty",
            "Vulnerability Assessment",
            "Post-Exploitation",
          ],
          correctAnswer: 2,
          explanation:
            "Vulnerability Assessment əsasən aşkarlama və prioritetləndirməyə fokuslanır; istismar onun əsas məqsədi deyil.",
        },
      },
      {
        id: 3,
        title: "Black, White və Grey Box",
        duration: "9 dəq",
        sections: [
          {
            body: "Testin tipi pentesterə əvvəlcədən verilən məlumatın həcminə görə seçilir.",
            bullets: [
              "Black Box — daxili məlumat yoxdur; xarici hücumçu baxışını simulyasiya edir.",
              "White Box — mənbə kodu, şəbəkə sxemi və hesablar daxil olmaqla tam məlumat verilir.",
              "Grey Box — məhdud daxili məlumatla real kompromis olunmuş istifadəçi ssenarisi qurulur.",
            ],
          },
          {
            heading: "Praktik seçim",
            body: "Daha az məlumat realizmi artırsa da vaxtı uzadır. Daha çox məlumat isə ayrılmış müddətdə daha dərin yoxlama aparmağa imkan verir.",
          },
        ],
        question: {
          prompt: "Mənbə kodu və şəbəkə sxemi verilən test hansı növdür?",
          options: ["Black Box", "White Box", "Grey Box", "Blind Box"],
          correctAnswer: 1,
          explanation:
            "White Box yanaşmasında pentester tam daxili məlumata malik olur və daha dərin yoxlama aparır.",
        },
      },
      {
        id: 4,
        title: "Pentestinq metodologiyası",
        duration: "12 dəq",
        sections: [
          {
            body: "Peşəkar pentest xaotik deyil. İş PTES kimi çərçivələrə uyğun, izlənilə bilən mərhələlərlə aparılır.",
            bullets: [
              "01 · Pre-engagement — məqsəd, scope və Rules of Engagement",
              "02 · Reconnaissance — hədəf haqqında məlumat toplama",
              "03 · Scanning & Enumeration — port, servis və versiyaları müəyyən etmə",
              "04 · Exploitation — seçilmiş zəifliyin təsirini sübut etmə",
              "05 · Post-Exploitation — girişin təsirini və əhatəsini qiymətləndirmə",
              "06 · Reporting — riskləri və düzəliş addımlarını sənədləşdirmə",
            ],
          },
          {
            heading: "Proses iterativdir",
            body: "Yeni tapıntı komandanı əvvəlki mərhələyə qaytara bilər. Ən vacib nəticə isə təşkilatın istifadə edə biləcəyi aydın hesabatdır.",
          },
        ],
        question: {
          prompt: "Nmap ilə açıq portları müəyyən etmək hansı mərhələyə aiddir?",
          options: [
            "Pre-engagement",
            "Scanning & Enumeration",
            "Post-Exploitation",
            "Reporting",
          ],
          correctAnswer: 1,
          explanation:
            "Portların, servislərin və versiyaların texniki aşkarlanması Scanning & Enumeration mərhələsidir.",
        },
      },
      {
        id: 5,
        title: "Hüquqi və etik çərçivə",
        duration: "10 dəq",
        sections: [
          {
            body: "Pentestinq yalnız yazılı icazə əsasında qanunidir. Yaxşı niyyət texniki fəaliyyəti avtomatik olaraq qanuni etmir.",
            bullets: [
              "Scope — test edilə bilən sistem, domen və IP sərhədlərini göstərir.",
              "Rules of Engagement — vaxtı, icazəli üsulları və əlaqə qaydasını müəyyən edir.",
              "Authorization letter — mütəxəssisin razılaşdırılmış işi gördüyünü təsdiqləyir.",
            ],
          },
          {
            heading: "Əsas prinsip",
            body: "Sadəcə bacardığın üçün etməyə haqqın yoxdur. Etik hakerlik bacarıq qədər məsuliyyət və etimaddır.",
          },
        ],
        question: {
          prompt: "Test saatlarını və icazə verilən üsulları hansı sənəd tənzimləyir?",
          options: [
            "Risk Register",
            "Rules of Engagement",
            "Vulnerability Report",
            "Service Catalogue",
          ],
          correctAnswer: 1,
          explanation:
            "Rules of Engagement testin necə aparılacağını, məhdudiyyətləri və kritik hal zamanı əlaqəni dəqiqləşdirir.",
        },
      },
    ],
  },
  {
    slug: "grc-foundations",
    title: "GRC əsasları",
    shortTitle: "Introduction to GRC",
    eyebrow: "Müdafiə və idarəetmə · Room 02",
    description:
      "Governance, Risk və Compliance sütunlarının təşkilatın kibertəhlükəsizlik qərarlarını necə birləşdirdiyini öyrən.",
    path: "Blue Team Path",
    module: "Təhlükəsizlik idarəetməsi",
    category: "GRC",
    type: "Analysis",
    difficulty: "Başlanğıc",
    duration: "55–70 dəq",
    points: 650,
    progress: 0,
    learners: 96,
    accent: "red",
    sourceFile: "Introduction_to_GRC_Detailed.md",
    objectives: [
      "Governance, Risk və Compliance anlayışlarını izah etmək",
      "Üç sütunun bir-birini necə tamamladığını anlamaq",
      "Risk cavab strategiyalarını real ssenariyə tətbiq etmək",
      "Əsas GRC çərçivələrini və yetkinlik pillələrini tanımaq",
    ],
    tasks: [
      {
        id: 1,
        title: "GRC nədir?",
        duration: "9 dəq",
        sections: [
          {
            body: "GRC — Governance, Risk və Compliance funksiyalarını vahid strategiyada birləşdirən idarəetmə yanaşmasıdır. Məqsəd təşkilatın hədəflərinə etibarlı çatması, qeyri-müəyyənliyi idarə etməsi və dürüst fəaliyyət göstərməsidir.",
          },
          {
            heading: "Üç əsas sual",
            body: "GRC rəhbərliyə qərar vermək üçün ortaq dil yaradır.",
            bullets: [
              "Governance: Doğru işi, doğru qaydada görürükmü?",
              "Risk: Hədəfimizə çatmağa nə mane ola bilər?",
              "Compliance: Bizə tətbiq olunan qaydalara əməl edirikmi?",
            ],
          },
        ],
        question: {
          prompt: "GRC-ni ən düzgün təsvir edən fikir hansıdır?",
          options: [
            "Yalnız audit proqramıdır",
            "Üç funksiyanı birləşdirən idarəetmə yanaşmasıdır",
            "Yalnız qanunların siyahısıdır",
            "Texniki zəiflik skaneridir",
          ],
          correctAnswer: 1,
          explanation:
            "GRC ayrı bir alət və ya şöbə deyil; idarəetmə, risk və uyğunluğu ortaq məqsəd ətrafında birləşdirən sistemli yanaşmadır.",
        },
      },
      {
        id: 2,
        title: "Üç sütun birlikdə",
        duration: "11 dəq",
        sections: [
          {
            body: "Governance istiqaməti və məsuliyyəti müəyyən edir. Risk Management qeyri-müəyyənliyi ölçür. Compliance isə qərarların qanun, standart və daxili siyasətlərə uyğunluğunu yoxlayır.",
          },
          {
            heading: "Silo probleminin həlli",
            body: "Funksiyalar ayrı işlədikdə auditlər təkrarlanır, risk dili fərqlənir və sahibsiz boşluqlar yaranır. İnteqrasiya vahid məlumat mənbəyi, ortaq prioritet və aydın hesabat yaradır.",
          },
        ],
        question: {
          prompt: "Governance-in əsas rolu hansıdır?",
          options: [
            "Yalnız texniki nəzarət qurmaq",
            "İstiqamət, struktur və hesabatlılıq yaratmaq",
            "Bütün riskləri sıfırlamaq",
            "Yalnız cərimələri hesablamaq",
          ],
          correctAnswer: 1,
          explanation:
            "Governance təşkilatın istiqamətini, qərar mexanizmini və kimin nəyə cavabdeh olduğunu müəyyən edir.",
        },
      },
      {
        id: 3,
        title: "Risk dövrü və cavablar",
        duration: "14 dəq",
        sections: [
          {
            body: "Risk idarəetməsi riskin aşkarlanması, qiymətləndirilməsi, prioritetləndirilməsi, cavab seçimi, nəzarətlərin tətbiqi və davamlı monitorinq dövrüdür.",
            bullets: [
              "Avoid — risk yaradan fəaliyyəti dayandır.",
              "Mitigate — ehtimalı və ya təsiri nəzarətlə azalt.",
              "Transfer — maliyyə yükünün bir hissəsini üçüncü tərəfə ötür.",
              "Accept — əsaslandırılmış şəkildə riski qəbul et.",
            ],
          },
          {
            heading: "Nəzarət növləri",
            body: "Preventive nəzarət hadisəni qabaqlayır, detective nəzarət hadisəni aşkarlayır, corrective nəzarət isə normal fəaliyyəti bərpa edir.",
          },
        ],
        question: {
          prompt: "MFA tətbiq etməklə hesab oğurluğu ehtimalını azaltmaq hansı cavabdır?",
          options: ["Avoid", "Mitigate", "Transfer", "Accept"],
          correctAnswer: 1,
          explanation:
            "MFA fəaliyyəti dayandırmır; təhlükənin uğur ehtimalını nəzarət vasitəsilə azaltdığı üçün mitigate strategiyasıdır.",
        },
      },
      {
        id: 4,
        title: "Çərçivələr və standartlar",
        duration: "13 dəq",
        sections: [
          {
            body: "Təşkilatlar ehtiyaclarına görə bir neçə çərçivəni birlikdə istifadə edir. Hər çərçivə fərqli idarəetmə problemini strukturlaşdırır.",
            bullets: [
              "COSO ERM — müəssisə risklərini strategiya ilə birləşdirir.",
              "ISO 31000 — ümumi risk idarəetmə prinsipləri verir.",
              "ISO 27001 — informasiya təhlükəsizliyi idarəetmə sistemini qurur.",
              "NIST CSF — Identify, Protect, Detect, Respond, Recover funksiyalarını təqdim edir.",
              "COBIT — İT idarəetməsi və nəzarətlərinə fokuslanır.",
            ],
          },
          {
            heading: "Bir ölçü hamıya uyğun deyil",
            body: "Orta ölçülü şirkət ümumi risk üçün COSO, informasiya təhlükəsizliyi üçün ISO 27001 və kibertəhlükəsizlik təcrübələri üçün NIST CSF seçə bilər.",
          },
        ],
        question: {
          prompt: "İnformasiya təhlükəsizliyi idarəetmə sisteminə fokuslanan standart hansıdır?",
          options: ["ISO 27001", "COSO ERM", "ISO 31000", "ITIL"],
          correctAnswer: 0,
          explanation:
            "ISO 27001 təşkilatda Information Security Management System (ISMS) qurmaq üçün tələblər verir.",
        },
      },
      {
        id: 5,
        title: "GRC yetkinliyi və ssenari",
        duration: "12 dəq",
        sections: [
          {
            body: "GRC yetkinliyi Fragmented səviyyədən Optimized səviyyəyə qədər inkişaf edir. Yetkin təşkilatda risk qərarları strategiyaya inteqrasiya olunur, göstəricilər ölçülür və nəzarətlər davamlı təkmilləşdirilir.",
            bullets: [
              "Level 1 — Fragmented: reaktiv və ayrı-ayrı proseslər",
              "Level 2 — Defined: əsas siyasətlər mövcuddur",
              "Level 3 — Integrated: ortaq risk dili və koordinasiya",
              "Level 4 — Managed: KPI/KRI ilə ölçülən proseslər",
              "Level 5 — Optimized: proaktiv analitika və davamlı inkişaf",
            ],
          },
          {
            heading: "Ssenari",
            body: "Vendor yoxlanmadan geniş sistem girişi alır və məlumat sızması baş verir. Governance siyasət boşluğu, risk qiymətləndirilməsinin aparılmaması və compliance sübutunun olmaması bir hadisədə kəsişir.",
          },
        ],
        question: {
          prompt: "Ortaq risk dili və koordinasiya hansı yetkinlik səviyyəsinə uyğundur?",
          options: ["Fragmented", "Defined", "Integrated", "Optimized"],
          correctAnswer: 2,
          explanation:
            "Integrated səviyyədə governance, risk və compliance komandaları ortaq taksonomiya və məlumatla koordinasiyalı işləyir.",
        },
      },
    ],
  },
];

export function getRoom(slug: string) {
  return rooms.find((room) => room.slug === slug);
}
