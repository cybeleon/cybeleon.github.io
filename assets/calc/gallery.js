/* "Others" — algorithms, charts, pictures & reference tables.
   Each entry is a Calc.ref({...}) block. To add a picture: drop the file into assets/img/ and add an
   { type:'image', src:'assets/img/<file>', alt:'…', caption:'…' } block. Full guide: HOW-TO-ADD-IMAGES.md */
(function () {
  const OTH = 'Others — algorithms, charts & references';
  Calc.group({ id: OTH, title: OTH, order: 9000, keywords: ['gambar', 'algoritma', 'bagan', 'chart', 'algorithm', 'picture', 'figure', 'referensi'] });

  /* ---- Speech banana ---- */
  Calc.ref({
    id: 'speech-banana', group: OTH, title: 'Speech banana', subtitle: 'Audiogram · speech sounds by frequency and intensity',
    keywords: ['speech banana', 'pisang bicara', 'audiogram', 'audiometri', 'hearing loss', 'tuli', 'frequency', 'Ling sounds', 'THT', 'ENT', 'pendengaran', 'phoneme', 'fonem'],
    blocks: [
      { type: 'image', src: 'assets/img/speech-banana.svg', alt: 'Speech banana on an audiogram', caption: 'Schematic speech banana on an audiogram (original illustration; positions are approximate). Tap to enlarge.' },
      { type: 'list', items: [
        'Plot the patient’s audiogram over the banana: any phoneme whose region lies below the patient’s thresholds is inaudible without amplification.',
        'Sensorineural loss from high frequencies (presbycusis, noise, ototoxicity) removes the soft high-pitched consonants first (s, f, th, sh, k, t) → “hears but cannot understand”.',
        'Low-frequency loss (e.g. early Ménière) affects vowels and voiced consonants (m, b, d).',
      ] },
      { type: 'table', caption: 'Degree of hearing loss (average of 500, 1000, 2000, 4000 Hz; common ISO/ASHA-type bands)', head: ['Degree', 'dB HL'], rows: [['Normal', '≤ 25'], ['Mild', '26–40'], ['Moderate', '41–55'], ['Moderately severe', '56–70'], ['Severe', '71–90'], ['Profound', '> 90']] },
    ],
    note: 'Replace the SVG with your preferred chart at any time: put the file in assets/img/ and change the src above.',
    refs: [{ text: 'Katz J, ed. Handbook of Clinical Audiology, 7th ed. Philadelphia: Wolters Kluwer; 2015.' }],
  });

  /* ---- Congenital SNHL algorithm ---- */
  Calc.ref({
    id: 'algoritma-snhl-kongenital', group: OTH, title: 'Algoritma tatalaksana tuli sensorineural kongenital', subtitle: 'Skrining → diagnosis → habilitasi (1–3–6)',
    keywords: ['tuli sensorineural', 'tuli kongenital', 'sensorineural hearing loss', 'congenital hearing loss', 'SNHL', 'OAE', 'BERA', 'ABR', 'AABR', 'skrining pendengaran bayi', 'newborn hearing screening', 'implan koklea', 'cochlear implant', 'alat bantu dengar', 'hearing aid', 'JCIH', 'algoritma', 'THT'],
    intro: 'Ringkasan umum berdasarkan kerangka JCIH 1-3-6. Untuk algoritma resmi nasional/institusi, tambahkan gambarnya di bawah (lihat panduan).',
    blocks: [
      { type: 'image', src: 'assets/img/algoritma-snhl-kongenital.png', alt: 'Algoritma tatalaksana tuli sensorineural kongenital', caption: 'Algoritma tatalaksana tuli sensorineural kongenital (taruh file gambar di sini).' },
      { type: 'table', head: ['Tahap', 'Waktu', 'Tindakan'], rows: [
        ['1. Skrining', '≤ 1 bulan', 'OAE dan/atau AABR pada semua bayi baru lahir. Bayi NICU > 5 hari: AABR. Gagal → ulang skrining.'],
        ['2. Diagnosis', '≤ 3 bulan', 'Rujuk audiologi/THT bila gagal skrining ulang: ABR/BERA click + frekuensi spesifik (tone-burst), OAE, timpanometri (probe 1000 Hz pada bayi < 6 bulan), refleks akustik.'],
        ['3. Intervensi', '≤ 6 bulan', 'Alat bantu dengar dalam ± 1 bulan setelah diagnosis, intervensi dini/terapi wicara-bahasa, dukungan keluarga.'],
        ['4. Evaluasi etiologi', 'Paralel', 'Riwayat/keluarga, pemeriksaan THT; CMV kongenital (PCR urin/saliva dalam 21 hari pertama), TORCH/sifilis bila indikasi; genetik (mis. GJB2/konneksin 26, panel tuli); EKG (sindrom Jervell–Lange-Nielsen/QT panjang); oftalmologi (sindrom Usher, dll.); fungsi ginjal/tiroid bila klinis sesuai; pencitraan (CT tulang temporal/MRI untuk anomali koklea & n. koklearis).'],
        ['5. Kandidat implan koklea', 'Setelah evaluasi', 'Manfaat alat bantu dengar tidak adekuat (umumnya setelah uji coba ≥ 3–6 bulan; tuli sangat berat/profound dapat lebih cepat), koklea dan n. koklearis memadai, dukungan keluarga & habilitasi. Idealnya sebelum usia 12 bulan–2 tahun.'],
        ['6. Pemantauan', 'Berkala', 'Audiologi tiap 3–6 bulan awalnya; pantau perkembangan bahasa; deteksi tuli progresif/late-onset pada faktor risiko (CMV, sindrom, meningitis).'],
      ] },
      { type: 'table', caption: 'Faktor risiko (JCIH 2019) — pemantauan ketat meski skrining lolos', head: ['Kategori', 'Contoh'], rows: [
        ['Keluarga', 'Riwayat keluarga tuli permanen pada masa anak'],
        ['Perinatal', 'NICU > 5 hari, ventilator/ECMO, hiperbilirubinemia dengan transfusi tukar, aminoglikosida > 5 hari / loop diuretik'],
        ['Infeksi', 'CMV, rubella, sifilis, herpes, toksoplasmosis kongenital; meningitis bakteri postnatal'],
        ['Lain-lain', 'Anomali kraniofasial/telinga, sindrom terkait tuli, trauma kepala/fraktur tulang temporal, kemoterapi']] },
    ],
    note: 'Ringkasan ini bukan pengganti pedoman nasional/institusi. Waktu dan kriteria implan koklea dapat berbeda antar pusat — rujuk ke tim THT-audiologi.',
    refs: [{ text: 'Joint Committee on Infant Hearing. Year 2019 position statement: principles and guidelines for early hearing detection and intervention programs. J Early Hear Detect Interv 2019;4:1–44.' }],
  });

  /* ---- Reflexes ---- */
  const R = (...a) => a;
  Calc.ref({
    id: 'refleks-jalur', group: OTH, title: 'Refleks fisiologis & patologis dan jalurnya', subtitle: 'Segmen, saraf aferen–eferen, interpretasi',
    keywords: ['refleks', 'reflex', 'refleks fisiologis', 'refleks patologis', 'Babinski', 'Hoffmann', 'Chaddock', 'Oppenheim', 'Gordon', 'Schaeffer', 'Gonda', 'Rossolimo', 'Trömner', 'patella', 'achilles', 'biceps', 'triceps', 'kornea', 'cahaya', 'gag', 'cremaster', 'abdominal', 'primitif', 'UMN', 'LMN', 'neurologi', 'saraf', 'jalur refleks', 'klonus', 'snout', 'grasp', 'palmomental'],
    blocks: [
      { type: 'image', src: 'assets/img/refleks-jalur.png', alt: 'Diagram refleks dan jalurnya', caption: 'Diagram jalur refleks (taruh file gambar di sini).' },
      { type: 'table', caption: 'Refleks regang otot (tendon) — fisiologis', head: ['Refleks', 'Segmen', 'Saraf (aferen = eferen)', 'Respons'], rows: [
        R('Rahang (masseter)', 'Pons', 'N. V (cabang mandibula)', 'Penutupan rahang'),
        R('Biseps', 'C5–C6', 'N. muskulokutaneus', 'Fleksi siku'),
        R('Brakioradialis', 'C5–C6', 'N. radialis', 'Fleksi siku / supinasi lengan bawah'),
        R('Triseps', 'C7–C8', 'N. radialis', 'Ekstensi siku'),
        R('Fleksor jari', 'C8–T1', 'N. medianus / ulnaris', 'Fleksi jari'),
        R('Adduktor', 'L2–L4', 'N. obturatorius', 'Adduksi paha'),
        R('Patella (lutut)', 'L2–L4 (L3–L4)', 'N. femoralis', 'Ekstensi lutut'),
        R('Hamstring medial', 'L5–S1', 'N. iskiadikus (tibialis)', 'Fleksi lutut'),
        R('Achilles (tumit)', 'S1–S2', 'N. tibialis', 'Plantarfleksi pergelangan kaki'),
      ] },
      { type: 'table', caption: 'Refleks superfisial, mukosa, dan batang otak — fisiologis', head: ['Refleks', 'Segmen', 'Aferen → pusat → eferen', 'Respons'], rows: [
        R('Kornea / konjungtiva', 'Pons', 'N. V1 (oftalmikus) → inti sensorik V → inti fasialis → N. VII', 'Kedip bilateral (m. orbikularis okuli)'),
        R('Cahaya pupil', 'Mesensefalon', 'N. II → area pretektal → inti Edinger–Westphal bilateral → N. III (parasimpatis)', 'Miosis direk dan konsensual'),
        R('Akomodasi', 'Mesensefalon', 'N. II → korteks visual → area pretektal → N. III', 'Miosis, konvergensi, akomodasi lensa'),
        R('Gag (muntah)', 'Medula', 'N. IX → nukleus traktus solitarius → n. ambigus → N. X (± IX)', 'Kontraksi faring, elevasi uvula'),
        R('Okulosefalik (doll’s eyes)', 'Pons–mesensefalon', 'N. VIII/proprioseptif leher → inti vestibular → MLF → N. III, VI', 'Mata berlawanan arah gerakan kepala (batang otak utuh)'),
        R('Abdominal atas / tengah / bawah', 'T8–T9 / T10 / T11–T12', 'Nn. interkostalis–iliohipogastrik–ilioinguinal', 'Umbilikus bergeser ke sisi rangsang'),
        R('Kremaster', 'L1–L2', 'N. genitofemoralis (aferen: cabang femoral; eferen: cabang genital)', 'Elevasi testis ipsilateral'),
        R('Plantar', 'S1–S2 (L5–S1)', 'N. tibialis', 'Fleksi jari kaki (normal)'),
        R('Bulbokavernosus', 'S2–S4', 'N. pudendus', 'Kontraksi otot bulbokavernosus'),
        R('Anal wink (kutaneo-anal)', 'S2–S5', 'N. pudendus (n. rektal inferior)', 'Kontraksi sfingter ani eksterna'),
      ] },
      { type: 'table', caption: 'Refleks patologis (tanda lesi UMN / traktus kortikospinal)', head: ['Refleks', 'Cara', 'Respons positif', 'Catatan'], rows: [
        R('Babinski', 'Gores sisi lateral telapak kaki dari tumit ke arah pangkal jari', 'Dorsofleksi ibu jari ± jari lain mengembang (fanning)', 'Normal pada bayi < ±12–24 bulan; lengkung S1 aferen, eferen m. ekstensor hallucis longus (L5)'),
        R('Chaddock', 'Gores sisi lateral malleolus lateralis', 'Seperti Babinski', 'Ekuivalen Babinski'),
        R('Oppenheim', 'Usap tekan krista tibia dari proksimal ke distal', 'Seperti Babinski', ''),
        R('Gordon', 'Pencet otot betis', 'Seperti Babinski', ''),
        R('Schaeffer', 'Pencet tendon Achilles', 'Seperti Babinski', ''),
        R('Gonda', 'Tekuk jari ke-4 kaki lalu lepas', 'Seperti Babinski', ''),
        R('Stransky', 'Tekuk jari ke-5 ke lateral', 'Seperti Babinski', ''),
        R('Hoffmann', 'Sentil ujung jari tengah', 'Fleksi ibu jari dan telunjuk', 'Lengkung C7–T1 (N. medianus); lesi UMN servikal, dapat asimetris pada sebagian orang normal'),
        R('Trömner', 'Ketuk permukaan volar ujung jari tengah', 'Fleksi ibu jari dan telunjuk', 'Setara Hoffmann'),
        R('Rossolimo', 'Ketuk permukaan plantar pangkal jari', 'Fleksi plantar jari-jari', 'UMN'),
        R('Mendel–Bechterew', 'Ketuk dorsum kaki (os kuboid)', 'Fleksi plantar jari-jari', 'UMN'),
        R('Klonus (pergelangan kaki / patela)', 'Dorsofleksi cepat dan tahan / dorong patela ke distal', 'Kontraksi ritmik berulang ≥ 5 ketukan', 'Hiperrefleksia UMN'),
      ] },
      { type: 'table', caption: 'Refleks primitif / frontal release', head: ['Refleks', 'Cara', 'Respons', 'Bermakna pada'], rows: [
        R('Menggenggam (grasp)', 'Gores telapak tangan', 'Menggenggam jari pemeriksa', 'Lesi lobus frontal kontralateral / difus'),
        R('Snout', 'Ketuk bibir atas', 'Bibir mencucu', 'Demensia, lesi frontal'),
        R('Palmomental', 'Gores telapak tangan (eminensia tenar)', 'Kontraksi m. mentalis ipsilateral (aferen N. medianus, eferen N. VII)', 'Lesi frontal; juga muncul pada lansia normal'),
        R('Glabela (Myerson)', 'Ketuk glabela berulang', 'Berkedip terus (tidak habituasi)', 'Parkinson, lesi frontal'),
        R('Menghisap / rooting', 'Sentuh bibir / pipi', 'Menghisap / menoleh', 'Normal pada bayi; patologis pada dewasa'),
      ] },
      { type: 'note', tone: 'mute', text: 'Ringkasan segmen mengikuti buku ajar neurologi klinik; sumber dapat berbeda ±1 segmen. Hiperrefleksia + Babinski + spastisitas = UMN; hiporefleksia/arefleksia + atrofi + fasikulasi = LMN.' },
    ],
    refs: [
      { text: 'Campbell WW. DeJong’s The Neurologic Examination, 8th ed. Philadelphia: Wolters Kluwer; 2019.' },
      { text: 'Ropper AH, Samuels MA, Klein JP, Prasad S. Adams and Victor’s Principles of Neurology, 11th ed. New York: McGraw-Hill; 2019.' },
    ],
  });
})();
