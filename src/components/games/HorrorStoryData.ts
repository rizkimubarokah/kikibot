export interface StoryNode {
    id: string;
    text: string;
    choices: Choice[];
    bgEffect?: 'normal' | 'heartbeat' | 'glitch' | 'red-flash' | 'shake' | 'blood';
    chapter?: string;
    characterSpeaking?: 'sculptor' | 'anna' | 'marcus' | 'detective' | 'narrator';
}

export interface Choice {
    text: string;
    nextNodeId: string;
    effect?: (state: GameState) => Partial<GameState>;
    requiredState?: (state: GameState) => boolean;
    timerSeconds?: number; // Visual countdown effect
}

export interface GameState {
    sanity: number; // 0-100
    trust: number; // 0-100 (Trust with the killer)
    annaRelation: number; // -100 to 100 (relationship with Anna)
    marcusRelation: number; // -100 to 100 (relationship with Marcus)
    hasWeapon: boolean;
    knowsName: boolean;
    isInjured: boolean;
    discoveries: string[]; // Clues found: 'basement_key', 'anna_note', 'police_radio', etc.
    timeElapsed: number; // Minutes elapsed in story
    act: number; // Story act (1, 2, or 3)
}

export const INITIAL_STATE: GameState = {
    sanity: 100,
    trust: 0,
    annaRelation: 0,
    marcusRelation: 0,
    hasWeapon: false,
    knowsName: false,
    isInjured: false,
    discoveries: [],
    timeElapsed: 0,
    act: 1,
};

export const STORY_NODES: Record<string, StoryNode> = {
    'start': {
        id: 'start',
        chapter: 'ACT I: AWAKENING',
        text: `Dingin. Lembab. Bau besi berkarat memenuhi hidungmu.

Kamu membuka mata perlahan. Gelap gulita. Tanganmu terikat kuat ke sandaran kursi kayu yang keras. Kepala terasa pening, seperti habis dipukul benda tumpul.

Suara tetesan air terdengar dari kejauhan... *Tes... Tes...*

Di sudut ruangan, kamu mendengar suara napas... seseorang lain ada di sini.`,
        choices: [
            { text: "\"Halo? Siapa di sana?\"", nextNodeId: 'call_out', effect: (s) => ({ timeElapsed: s.timeElapsed + 1 }) },
            { text: "Diam dan observasi situasi.", nextNodeId: 'observe_silent', effect: (s) => ({ sanity: s.sanity + 5, timeElapsed: s.timeElapsed + 2 }) },
            { text: "Berteriak sekeras mungkin!", nextNodeId: 'scream_start', effect: (s) => ({ sanity: s.sanity - 10, timeElapsed: s.timeElapsed + 1 }) },
        ]
    },
    'call_out': {
        id: 'call_out',
        text: `"Halo? Siapa di sana?"

Suara serak perempuan menjawab dari kegelapan: "Jangan... berisik. Dia akan dengar..."

Matamu mulai terbiasa. Di pojok, ada wanita dengan rambut kusut, tangan juga terikat. Wajahnya penuh luka lama.`,
        choices: [
            { text: "\"Siapa 'dia'? Tolong jelaskan!\"", nextNodeId: 'anna_intro', effect: (s) => ({ annaRelation: s.annaRelation + 10 }) },
            { text: "\"Berapa lama kau di sini?\"", nextNodeId: 'anna_time' },
            { text: "Abaikan dia, cari jalan keluar.", nextNodeId: 'ignore_anna', effect: (s) => ({ annaRelation: s.annaRelation - 15 }) },
        ]
    },
    'anna_intro': {
        id: 'anna_intro',
        characterSpeaking: 'anna',
        text: `"'Dia' adalah pembunuh. Pematung gila. Namanya... The Sculptor. Dia membawa kita ke sini untuk 'proyek seni'nya."

Dia tertawa pahit.

"Aku Anna. Aku korban kesembilan. Atau sepuluh? Aku sudah lupa berapa lama di sini... mungkin seminggu."`,
        choices: [
            { text: "\"Kita harus kabur bersama!\"", nextNodeId: 'team_anna', effect: (s) => ({ annaRelation: s.annaRelation + 20, discoveries: [...s.discoveries, 'anna_ally'] }) },
            { text: "\"Kenapa kau masih hidup?\"", nextNodeId: 'anna_suspicion' },
            { text: "\"Apa yang dia lakukan pada korban lain?\"", nextNodeId: 'anna_victims', effect: (s) => ({ sanity: s.sanity - 5 }) },
        ]
    },
    'team_anna': {
        id: 'team_anna',
        text: "Anna menatapmu dengan mata berkaca-kaca.\n\n\"Kau... percaya aku? Kebanyakan orang baru pikir aku sudah gila. Atau malah kaki tangannya.\"\n\nDia mulai merapat.\n\n\"Dengar. Ada seseorang lain di sini. Marcus. Dia asistennya. Tapi dia... berbeda. Mungkin bisa diajak bicara.\"",
        choices: [
            { text: "\"Bagaimana cara lepas dari tali ini?\"", nextNodeId: 'escape_plan_1' },
            { text: "\"Ceritakan tentang Marcus.\"", nextNodeId: 'marcus_info', effect: (s) => ({ discoveries: [...s.discoveries, 'marcus_exist'] }) },
        ]
    },
    'escape_plan_1': {
        id: 'escape_plan_1',
        text: "\"Ada pecahan kaca di bawah kursimu. Aku sembunyikan kemarin. Tapi kau harus diam-diam. Kalau dia dengar kita merencana sesuatu...\"\n\nTiba-tiba lampu ruangan menyala terang. Menyilaukan.\n\nPintu besi terbuka dengan bunyi keras. CRANK!",
        bgEffect: 'red-flash',
        choices: [
            { text: "Pura-pura masih pingsan.", nextNodeId: 'fake_unconscious' },
            { text: "Tatap matanya langsung.", nextNodeId: 'sculptor_enters_bold', effect: (s) => ({ trust: s.trust + 5 }) },
        ]
    },
    'sculptor_enters_bold': {
        id: 'sculptor_enters_bold',
        characterSpeaking: 'sculptor',
        chapter: 'ACT II: THE SCULPTOR',
        text: "Seorang pria tinggi besar masuk. Apron kulit hitam penuh noda. Topeng porselen putih dengan retakan seperti laba-laba menutupi wajahnya.\n\n\"Ah. Karya terbaruku sudah bangun. Dan matamu... penuh api. Bagus. SANGAT bagus.\"\n\nDia menghampiri Anna.\n\n\"Anna, sayang. Kau mengajarinya untuk memberontak?\"",
        choices: [
            { text: "\"Jangan sentuh dia!\"", nextNodeId: 'protect_anna', effect: (s) => ({ annaRelation: s.annaRelation + 25, trust: s.trust - 10 }) },
            { text: "\"Apa maumu dari kami?\"", nextNodeId: 'sculptor_motive' },
            { text: "Diam dan amati.", nextNodeId: 'sculptor_lecture', effect: (s) => ({ sanity: s.sanity + 5 }) },
        ]
    },
    'protect_anna': {
        id: 'protect_anna',
        bgEffect: 'heartbeat',
        text: "Pematung itu berhenti. Dia berbalik menghadapmu perlahan.\n\n\"Oh? Keberanian? Atau kebodohan?\"\n\nDia menamparmu. Keras. Telinga berdering.\n\n\"Tapi aku suka itu. Passion. Api. Inilah yang membedakan karya agung dari sampah.\"\n\nAnna berbisik: \"Jangan provokasi dia...\"",
        choices: [
            { text: "\"Kau BUKAN seniman. Kau monster!\"", nextNodeId: 'insult_sculptor', effect: (s) => ({ trust: s.trust - 30 }) },
            { text: "\"Apa yang membuatmu jadi seperti ini?\"", nextNodeId: 'sculptor_backstory', effect: (s) => ({ trust: s.trust + 15 }) },
            { text: "Ludahi wajahnya.", nextNodeId: 'spit_sculptor', effect: (_) => ({ isInjured: true }) },
        ]
    },
    'sculptor_backstory': {
        id: 'sculptor_backstory',
        characterSpeaking: 'sculptor',
        text: "Dia terdiam. Menarik kursi dan duduk.\n\n\"Apa yang membuatku seperti ini? Pertanyaan filosofis. Kebanyakan hanya menangis minta pulang.\"\n\n\"Aku dulu arsitek. Rumah, gedung, monument. Tapi semua MATI. Tidak ada jiwa. Sampai aku menyadari... hanya ketakutan manusia yang HIDUP. Murni. Jujur.\"\n\n\"Maka aku menciptakan karya yang hidup. Abadi.\"",
        choices: [
            { text: "\"Tapi mereka mati. Itu bukan abadi.\"", nextNodeId: 'philosophical_debate' },
            { text: "\"Biarkan kami pergi, aku janji tidak lapor polisi.\"", nextNodeId: 'beg_sculptor' },
            { text: "\"Ajarkan aku. Aku ingin mengerti.\"", nextNodeId: 'manipulate_sculptor', effect: (s) => ({ trust: s.trust + 30, sanity: s.sanity - 10 }) },
        ]
    },
    'manipulate_sculptor': {
        id: 'manipulate_sculptor',
        text: "Matanya berbinar di balik topeng.\n\n\"Kau... ingin BELAJAR?\"\n\nDia tertawa. Keras. Menggema.\n\n\"ANNA! Kau dengar ini?! Akhirnya! Seseorang yang PAHAM!\"\n\nDia melepaskan ikatanmu.\n\n\"Ikut aku. Aku akan tunjukkan galeri pribadiku.\"\n\nAnna menatapmu dengan tatapan... kecewa? Atau takut?",
        choices: [
            { text: "Ikuti dia (Strategi jangka panjang).", nextNodeId: 'gallery_visit', effect: (_) => ({ annaRelation: -20, act: 2 }) },
            { text: "Serang dia saat lengah!", nextNodeId: 'attack_sculptor_early', effect: (_) => ({ hasWeapon: true }) },
        ]
    },
    'gallery_visit': {
        id: 'gallery_visit',
        chapter: 'ACT II: THE GALLERY',
        bgEffect: 'red-flash',
        text: "Dia membawamu melewati lorong panjang. Dinding dipenuhi foto. Korban-korban sebelumnya. Wajah mereka... membeku dalam ketakutan murni.\n\n\"Ini koleksiku. 47 karya. Semuanya sempurna.\"\n\nDi ujung ruangan, ada meja besar. Di atasnya, alat-alat bedah.\n\nDan sesosok pria muda. Rambut hitam, kacamata. Dia sedang membersihkan gergaji.",
        choices: [
            { text: "\"Siapa dia?\"", nextNodeId: 'meet_marcus', effect: (s) => ({ discoveries: [...s.discoveries, 'marcus_seen'] }) },
            { text: "\"Foto-foto ini... mengerikan.\"", nextNodeId: 'disgust_art', effect: (s) => ({ trust: s.trust - 10, sanity: s.sanity - 10 }) },
            { text: "\"Luar biasa. Karya sejati.\" (Berbohong)", nextNodeId: 'fake_admire', effect: (s) => ({ trust: s.trust + 20 }) },
        ]
    },
    'meet_marcus': {
        id: 'meet_marcus',
        characterSpeaking: 'marcus',
        text: "Pria muda itu mendongak. Wajahnya pucat.\n\nPematung memperkenalkan: \"Ini Marcus. Muridku. Asistenku. Dia yang memilihmu.\"\n\nMarcus menghindari tatapan matamu.\n\n\"Maaf,\" bisiknya pelan. \"Aku hanya melakukan perintah.\"",
        choices: [
            { text: "\"Kau tidak harus ikut dia! Tolong aku!\"", nextNodeId: 'plead_marcus', effect: (s) => ({ marcusRelation: s.marcusRelation + 20 }) },
            { text: "\"Kau sama jahatnya dengan dia!\"", nextNodeId: 'blame_marcus', effect: (s) => ({ marcusRelation: s.marcusRelation - 20 }) },
            { text: "\"Apa yang dia paksa kau lakukan?\"", nextNodeId: 'marcus_story', effect: (s) => ({ marcusRelation: s.marcusRelation + 15 }) },
        ]
    },
    'marcus_story': {
        id: 'marcus_story',
        characterSpeaking: 'marcus',
        text: "Marcus menoleh ke Pematung. Dia mengangguk, memberi izin.\n\n\"Dia... menyelamatkan hidupku. Dua tahun lalu. Aku tunawisma. Kelaparan. Dia beri aku makan, tempat tinggal.\"\n\n\"Tapi harganya adalah... ini. Aku harus membantunya. Kalau tidak, aku yang akan jadi 'karya' berikutnya.\"\n\nAir matanya turun.",
        choices: [
            { text: "\"Kita bisa kabur bersama!\"", nextNodeId: 'recruit_marcus', effect: (s) => ({ marcusRelation: s.marcusRelation + 30, discoveries: [...s.discoveries, 'marcus_ally'] }) },
            { text: "\"Pengecut. Kau biarkan orang mati.\"", nextNodeId: 'insult_marcus', effect: (s) => ({ marcusRelation: s.marcusRelation - 30 }) },
            { text: "\"Aku mengerti. Ini bukan salahmu.\"", nextNodeId: 'empathy_marcus', effect: (s) => ({ marcusRelation: s.marcusRelation + 25, sanity: s.sanity - 5 }) },
        ]
    },
    'recruit_marcus': {
        id: 'recruit_marcus',
        text: "Marcus menatapmu dengan mata penuh harap.\n\nPematung tertawa.\n\n\"Mengharukan! Tapi sayangnya, pertunjukan harus dilanjutkan.\"\n\nDia mengambil pisau dari meja.\n\n\"Marcus. Buktikan kesetiaanmu. Potong jari kelingking 'teman' barumu.\"\n\nMarcus gemetar. \"Guru... aku tidak bisa...\"\n\n\"LAKUKAN. ATAU KAU YANG AKAN KUPOTONG.\"",
        bgEffect: 'shake',
        choices: [
            { text: "\"Marcus, jangan dengarkan dia!\"", nextNodeId: 'marcus_choice_refuse' },
            { text: "\"Lakukan saja. Aku tahan.\"", nextNodeId: 'marcus_choice_obey', effect: (s) => ({ marcusRelation: s.marcusRelation + 40, isInjured: true }) },
            { text: "Tendang Pematung saat dia lengah!", nextNodeId: 'fight_sculptor_marcus', timerSeconds: 5 },
        ]
    },

    // ===== BRANCHING PATHS =====

    'marcus_choice_refuse': {
        id: 'marcus_choice_refuse',
        text: "Marcus menurunkan pisau.\n\n\"Tidak. Aku sudah cukup. DUA TAHUN aku jadi budakmu!\"\n\nPematung terdiam. Lalu tersenyum di balik topeng.\n\n\"Bagus. Akhirnya kau tumbuh tulang punggung.\"\n\nDia menusuk Marcus. Tepat di perut.\n\nMarcus jatuh. Darah menggenang.",
        bgEffect: 'blood',
        choices: [
            { text: "\"TIDAK! MARCUS!\"", nextNodeId: 'marcus_death_path', effect: (s) => ({ sanity: s.sanity - 30, marcusRelation: 0 }) },
            { text: "Gunakan kesempatan, serang Pematung!", nextNodeId: 'attack_after_marcus_death', effect: (_) => ({ hasWeapon: true }) },
        ]
    },

    'attack_after_marcus_death': {
        id: 'attack_after_marcus_death',
        bgEffect: 'heartbeat',
        text: "Kau menyambar pisau dari tangan Marcus yang lemah. Darah membasahi genggamanmu.\n\nPematung terkejut.\n\n\"Oh! Bagus! INI yang aku cari! Survival instinct murni!\"\n\nDia mencoba menangkapmu, tapi kau lebih cepat. Tusukan mengenai bahunya!\n\nDia mundur, tertawa.\n\n\"Kau... istimewa.\"",
        choices: [
            { text: "Lari ke pintu keluar!", nextNodeId: 'escape_attempt_1', effect: (_) => ({ act: 3 }) },
            { text: "Habisi dia sekarang!", nextNodeId: 'kill_sculptor_attempt' },
            { text: "Bawa Marcus keluar!", nextNodeId: 'save_marcus_route', effect: (_) => ({ marcusRelation: 100 }) },
        ]
    },

    'escape_attempt_1': {
        id: 'escape_attempt_1',
        chapter: 'ACT III: ESCAPE',
        bgEffect: 'heartbeat',
        text: "Kau berlari menyusuri lorong. Gelap. Basah. Bau busuk.\n\nTiba-tiba kau dengar suara tembakan.\n\nLampu menyala. Sesosok wanita dengan jaket FBI berdiri di ujung lorong.\n\n\"FREEZE! FBI! Tangan di atas kepala!\"\n\nDi belakangmu, Pematung masih mengejar.",
        choices: [
            { text: "\"TOLONG! DIA PEMBUNUH!\"", nextNodeId: 'detective_saves', effect: (_) => ({ discoveries: ['police_arrive'] }) },
            { text: "Angkat tangan, tunjukkan kau tidak bersenjata.", nextNodeId: 'cooperative_ending' },
        ]
    },

    // ===== 20 ENDINGS START HERE =====

    // ENDING 1: SURVIVOR (Good Ending)
    'detective_saves': {
        id: 'detective_saves',
        text: "ENDING 1: SURVIVOR\n\n\"Drop your weapon!\" Detective Sarah Chen menembak. Pematung terjatuh.\n\nKau selamat. Diselamatkan tim FBI yang sudah melacak jejak pembunuhan berantai selama 3 tahun.\n\nAnna juga diselamatkan. Marcus... tidak bertahan.\n\nBertahun-tahun kemudian, kau masih mimpi buruk tentang basement itu. Tapi kau HIDUP.",
        bgEffect: 'normal',
        choices: []
    },

    // ENDING 2: INJURED ESCAPE (Good Ending - Variation)
    'cooperative_ending': {
        id: 'cooperative_ending',
        text: "ENDING 2: WOUNDED SURVIVOR\n\nKau mengangkat tangan. Detective Chen melihat darah di tubuhmu.\n\n\"Medic! We have casualties!\"\n\nPematung ditangkap hidup-hidup. Kau menjadi saksi utama dalam persidangan.\n\nKau kehilangan jari kelingking, tapi jiwa dan akalmu utuh. Itu lebih dari yang bisa dikatakan kebanyakan korbannya.",
        choices: []
    },

    // Additional endings will continue from branching paths... (continuing to 20 total)

    // ENDING 3-20 abbreviated for space, full implementation would include:
    // - Partnership endings (becoming apprentice, fake loyalty, taking over)
    // - Death endings (various methods/circumstances)
    // - Secret endings (time loop, Anna's revenge, burn it all)
    // - Special endings (possession, detective romance, mutual escape with Anna, etc.)

    // Placeholder nodes for other paths mentioned in choices
    'observe_silent': { id: 'observe_silent', text: "Kau diam. Mengamati. Ada seseorang lain di ruangan ini...", choices: [{ text: "Lanjut", nextNodeId: 'call_out' }] },
    'scream_start': { id: 'scream_start', text: "Teriakanmu menggema. Pintu besi terbuka dengan keras...", choices: [{ text: "Lanjut", nextNodeId: 'sculptor_enters_bold' }] },
    'anna_time': { id: 'anna_time', text: "\"Seminggu... atau selamanya. Waktu tidak ada artinya di sini.\"", choices: [{ text: "Lanjut", nextNodeId: 'anna_intro' }] },
    'ignore_anna': { id: 'ignore_anna', text: "Kau mengabaikannya. Dia menghela napas sedih.", choices: [{ text: "Lanjut", nextNodeId: 'escape_plan_1' }] },
    'anna_suspicion': { id: 'anna_suspicion', text: "\"Karena... aku berguna. Aku memasak. Membersihkan. Jadi budak.\"", choices: [{ text: "Lanjut", nextNodeId: 'team_anna' }] },
    'anna_victims': { id: 'anna_victims', text: "Anna menunjuk foto di dinding. Wajah-wajah yang tidak akan pernah pulang.", choices: [{ text: "Lanjut", nextNodeId: 'team_anna' }], bgEffect: 'red-flash' },
    'marcus_info': { id: 'marcus_info', text: "\"Marcus itu... rumit. Dia bukan monster seperti Sculptor. Tapi dia takut.\"", choices: [{ text: "Lanjut", nextNodeId: 'escape_plan_1' }] },
    'fake_unconscious': { id: 'fake_unconscious', text: "Kau memejamkan mata. Menahan napas...", choices: [{ text: "Lanjut", nextNodeId: 'sculptor_enters_bold' }] },
    'sculptor_motive': { id: 'sculptor_motive', text: "\"Aku mencari kesempurnaan. Dan kau mungkin kanvas terindahku.\"", choices: [{ text: "Lanjut", nextNodeId: 'sculptor_lecture' }] },
    'sculptor_lecture': { id: 'sculptor_lecture', text: "Dia bercerita panjang lebar tentang 'seni'nya yang sakit...", choices: [{ text: "Lanjut", nextNodeId: 'sculptor_backstory' }] },
    'insult_sculptor': { id: 'insult_sculptor', text: "\"MONSTER?! AKU ADALAH DEWA!\"\n\nDia memukulmu. Berkali-kali.", choices: [{ text: "Ending", nextNodeId: 'ending_beaten_to_death' }], bgEffect: 'shake' },
    'spit_sculptor': { id: 'spit_sculptor', text: "Air liurmu mendarat di topengnya. Dia mematahkan tanganmu.", choices: [{ text: "Ending", nextNodeId: 'ending_tortured' }], bgEffect: 'blood' },
    'philosophical_debate': { id: 'philosophical_debate', text: "\"Menarik. Kau filsuf. Tapi logika tidak berlaku di sini.\"", choices: [{ text: "Lanjut", nextNodeId: 'manipulate_sculptor' }] },
    'beg_sculptor': { id: 'beg_sculptor', text: "Dia tertawa. \"Janji pembohong.\"", choices: [{ text: "Lanjut", nextNodeId: 'sculptor_lecture' }] },
    'attack_sculptor_early': { id: 'attack_sculptor_early', text: "Kau menyerangnya, tapi dia lebih kuat...", choices: [{ text: "Ending", nextNodeId: 'ending_failed_escape' }], bgEffect: 'shake' },
    'disgust_art': { id: 'disgust_art', text: "\"Kau tidak punya jiwa apresiasi seni.\"", choices: [{ text: "Lanjut", nextNodeId: 'meet_marcus' }] },
    'fake_admire': { id: 'fake_admire', text: "Dia menepuk bahumu. \"Akhirnya, seseorang yang PAHAM!\"", choices: [{ text: "Lanjut", nextNodeId: 'meet_marcus' }] },
    'plead_marcus': { id: 'plead_marcus', text: "Marcus menatapmu dengan mata berkaca-kaca...", choices: [{ text: "Lanjut", nextNodeId: 'marcus_story' }] },
    'blame_marcus': { id: 'blame_marcus', text: "\"Aku... aku tahu,\" dia berbisik sedih.", choices: [{ text: "Lanjut", nextNodeId: 'marcus_story' }] },
    'empathy_marcus': { id: 'empathy_marcus', text: "Marcus tersenyum tipis. Untuk pertama kali.", choices: [{ text: "Lanjut", nextNodeId: 'recruit_marcus' }] },
    'insult_marcus': { id: 'insult_marcus', text: "Marcus menunduk. Kau kehilangan kemungkinan sekutu.", choices: [{ text: "Lanjut", nextNodeId: 'recruit_marcus' }] },
    'marcus_choice_obey': { id: 'marcus_choice_obey', text: "Marcus memotong jarimu. Air matanya mengalir. \"Maafkan aku...\"", choices: [{ text: "Lanjut", nextNodeId: 'torture_path' }], bgEffect: 'blood' },
    'fight_sculptor_marcus': { id: 'fight_sculptor_marcus', text: "Kau menendang Sculptor! Marcus ikut menyerang...", choices: [{ text: "Lanjut", nextNodeId: 'team_fight' }], bgEffect: 'heartbeat' },
    'marcus_death_path': { id: 'marcus_death_path', text: "Marcus menutup mata terakhir kali. Kau sendirian lagi.", choices: [{ text: "Lanjut", nextNodeId: 'attack_after_marcus_death' }] },
    'save_marcus_route': { id: 'save_marcus_route', text: "Kau menyeret Marcus keluar, meninggalkan jejak darah...", choices: [{ text: "Ending", nextNodeId: 'ending_hero_sacrifice' }] },
    'kill_sculptor_attempt': { id: 'kill_sculptor_attempt', text: "Kau berusaha membunuhnya, tapi dia terlalu tangguh...", choices: [{ text: "Ending", nextNodeId: 'ending_mutual_kill' }], bgEffect: 'blood' },

    // Death Endings (5 total)
    'ending_beaten_to_death': {
        id: 'ending_beaten_to_death',
        text: "ENDING 3: BROKEN\n\nKemarahan Sculptor tidak mengenal batas. Kau tidak bertahan malam itu.\n\nTubuhmu menjadi 'karya' nomor 48.",
        bgEffect: 'red-flash',
        choices: []
    },

    'ending_tortured': {
        id: 'ending_tortured',
        text: "ENDING 4: THE MASTERPIECE\n\n\"Perlawanan membuatmu istimewa,\" katanya sambil menyiapkan alat.\n\nKau mengalami 'proses kreatif'nya selama berjam-jam. \n\nAkhirnya, kesadaranmu padam. Untuk selamanya.",
        bgEffect: 'blood',
        choices: []
    },

    'ending_failed_escape': {
        id: 'ending_failed_escape',
        text: "ENDING 5: PREMATURE\n\nSeranganmu terlalu dini. Kau belum cukup kuat.\n\nDia menangkapmu dengan mudah.\n\n\"Sayang sekali. Kau punya potensi. Tapi terlalu terburu-buru.\"\n\nIni berakhir cepat.",
        choices: []
    },

    // Partnership Endings
    'ending_apprentice_willing': {
        id: 'ending_apprentice_willing',
        text: "ENDING 6: THE NEW SCULPTOR\n\nBertahun-tahun kemudian, detektif menemukan basement baru. Korban baru.\n\nTopeng yang sama. Metode yang sama.\n\nTapi ini bukan Sculptor asli. Dia sudah tua, pensiun.\n\nIni... murid terbaiknya. Kau.",
        bgEffect: 'glitch',
        choices: []
    },

    // Additional endings abbreviated...
    'ending_hero_sacrifice': {
        id: 'ending_hero_sacrifice',
        text: "ENDING 7: HERO'S BURDEN\n\nKau membawa Marcus keluar. Dia selamat.\n\nTapi Sculptor menembakmu dari belakang.\n\nMarcus menangis di sampingmu. \"Kau menyelamatkanku...\"\n\nKau tersenyum. Setidaknya ada yang selamat.",
        choices: []
    },

    'ending_mutual_kill': {
        id: 'ending_mutual_kill',
        text: "ENDING 8: PYRRHIC VICTORY\n\nKalian berdua terluka parah. Saling tikam.\n\nDia jatuh duluan. Kau menyusul.\n\nPolisi menemukan kalian berdua keesokan harinya. Tidak ada yang bertahan.",
        bgEffect: 'blood',
        choices: []
    },

    // Continuing with more endings to reach 20 total...
    'torture_path': { id: 'torture_path', text: "Rasa sakit luar biasa. Tapi kau masih hidup... untuk saat ini.", choices: [{ text: "Lanjut", nextNodeId: 'endure_torture' }] },
    'team_fight': { id: 'team_fight', text: "Berdua kalian melawan Sculptor...", choices: [{ text: "Lanjut", nextNodeId: 'escape_together' }], bgEffect: 'heartbeat' },
    'endure_torture': { id: 'endure_torture', text: "Kau bertahan melewati siksaan...", choices: [{ text: "Ending", nextNodeId: 'ending_stockholm' }] },
    'escape_together': { id: 'escape_together', text: "Kalian berhasil kabur bersama!", choices: [{ text: "Ending", nextNodeId: 'ending_duo_survivors' }] },

    'ending_stockholm': {
        id: 'ending_stockholm',
        text: "ENDING 9: STOCKHOLM\n\nSetelah minggu-minggu siksaan, pikiranmu mulai... berubah.\n\nMungkin dia benar. Mungkin ini seni.\n\nKetika polisi datang, kau malah melindunginya.\n\n\"Dia guru saya,\" katamu.",
        bgEffect: 'glitch',
        choices: []
    },

    'ending_duo_survivors': {
        id: 'ending_duo_survivors',
        text: "ENDING 10: BROTHERHOOD\n\nKau dan Marcus berhasil kabur.\n\nKalian saling jaga. Saling sembuhkan trauma.\n\nBertahun-tahun kemudian, kalian masih sahabat. Bertahan dari neraka yang sama.",
        choices: []
    },

    // Endings 11-20 (abbreviated/placeholder)
    'ending_anna_revenge': {
        id: 'ending_anna_revenge',
        text: "ENDING 11: ANNA'S WRATH\n\nAnna keluar dari bayang-bayang. Pistol di tangan.\n\n\"Ini untukmu, monster.\"\n\nBOOM.\n\nDia sudah merencanakan ini selama seminggu. Kau hanya alat.",
        choices: []
    },

    'ending_time_loop': {
        id: 'ending_time_loop',
        text: "ENDING 12: DEJA VU\n\nKau membuka mata. Tangan terikat. Basement yang sama.\n\nTapi... ini sudah terjadi sebelumnya?\n\nSuara tetesan air. *Tes. Tes.*\n\n\"Tidak lagi,\" bisikmu. \"Tidak kali ini.\"",
        bgEffect: 'glitch',
        choices: []
    },

    'ending_burn_all': {
        id: 'ending_burn_all',
        text: "ENDING 13: ASHES TO ASHES\n\nKau menemukan bensin di gudang.\n\nJika kau tidak bisa kabur... setidaknya kau bisa menghancurkan karya-karyanya.\n\nApi menyala. Basement terbakar.\n\nKau tidak keluar. Tapi dia kehilangan segalanya.",
        bgEffect: 'red-flash',
        choices: []
    },

    'ending_detective_romance': {
        id: 'ending_detective_romance',
        text: "ENDING 14: SAVED BY SARAH\n\nDetective Sarah Chen menyelamatkanmu.\n\nBertahun-tahun kemudian, kalian menikah. Dia pensiun dini.\n\nKalian tidak pernah bicara tentang basement itu. Tapi mimpi buruknya sama dengan milikmu.",
        choices: []
    },

    'ending_sculptor_suicide': {
        id: 'ending_sculptor_suicide',
        text: "ENDING 15: ARTIST'S SHAME\n\nKau berhasil menghancurkan semua karyanya.\n\nDia menatap puing.\n\n\"Tanpa karya... aku bukan siapa-siapa.\"\n\nDia bunuh diri. Kau selamat. Tapi kemenangannya hambar.",
        choices: []
    },

    'ending_possessed': {
        id: 'ending_possessed',
        text: "ENDING 16: HAUNTED\n\nKau kabur. Tapi sesuatu ikut keluar bersamamu.\n\nRoh korban-korban sebelumnya.\n\nSekarang kau melihat mereka. Setiap hari. Di cermin. Di bayangan.\n\n\"Gabung dengan kami,\" bisik mereka.",
        bgEffect: 'glitch',
        choices: []
    },

    'ending_takeover': {
        id: 'ending_takeover',
        text: "ENDING 17: NEW MANAGEMENT\n\nKau membunuh Sculptor.\n\nTapi basement ini... begitu sempurna.\n\nAlat-alat masih di sana. Ruangan masih siap.\n\nMungkin... satu karya. Untuk menghormatinya?\n\nBertahun-tahun kemudian, kau tidak bisa berhenti.",
        bgEffect: 'blood',
        choices: []
    },

    'ending_coma': {
        id: 'ending_coma',
        text: "ENDING 18: DREAM STATE\n\nKau membuka mata. Rumah sakit.\n\n\"Kau koma selama 6 bulan,\" kata dokter.\n\n\"Basement? Sculptor? Itu halusinasi trauma.\"\n\nTapi... jari kelingkingmu hilang. Dan nama 'Anna' tergores di tangan.",
        choices: []
    },

    'ending_immortal': {
        id: 'ending_immortal',
        text: "ENDING 19: THE LEGACY\n\nKau mengalahkannya. Tapi dying wishnya:\n\n\"Ceritakan kisahku. Jadikan aku abadi.\"\n\nKau menulis buku. Bestseller. Film. Serial.\n\nDia menang. Namanya akan diingat selamanya.",
        choices: []
    },

    'ending_perfect': {
        id: 'ending_perfect',
        text: "ENDING 20: TRUE ART\n\nKau menemukan kebenaran.\n\nDia bukan pembunuh. Dia... seniman sejati.\n\nKau mengerti sekarang. Rasa sakit adalah keindahan.\n\nKau meminta untuk menjadi karya terakhir. Sukarela.\n\n\"Terima kasih,\" bisikmu saat kesadaran memudar.\n\n\"Ini... sempurna.\"",
        bgEffect: 'glitch',
        choices: []
    },

};
