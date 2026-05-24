export interface MultipleChoiceQuestion {
  id: number;
  type: 'pg';
  question: string;
  options: {
    key: string; // 'a', 'b', 'c', 'd' or 'A', 'B', 'C', 'D'
    text: string;
  }[];
  correctKey: string;
  score: number;
}

export interface IsianQuestion {
  id: number;
  type: 'isian';
  question: string;
  correctAnswers: string[]; // List of synonyms or exact match words (processed lowercase)
  score: number;
}

export interface EssayQuestion {
  id: number;
  type: 'essay';
  question: string;
  referenceAnswer: string;
  score: number;
}

export type Question = MultipleChoiceQuestion | IsianQuestion | EssayQuestion;

export interface ExamClass {
  id: number;
  name: string;
  description: string;
  stats: {
    pgCount: number;
    isianCount: number;
    essayCount: number;
    totalQuestions: number;
    maxScore: number;
  };
  questions: Question[];
}

export const questionsData: ExamClass[] = [
  {
    id: 4,
    name: "Kelas 4",
    description: "Asesmen Sumatif Akhir Semester Genap Tahun Pelajaran 2025/2026",
    stats: {
      pgCount: 30,
      isianCount: 10,
      essayCount: 5,
      totalQuestions: 45,
      maxScore: 70 // 30*1 (PG) + 10*2 (Isian) + 5*4 (Essay) = 30 + 20 + 20 = 70
    },
    questions: [
      // PILIHAN GANDA (1 - 30)
      {
        id: 1,
        type: 'pg',
        question: "Ibadah yang sejati seharusnya tercermin dalam ....",
        options: [
          { key: 'A', text: "rumah, keluarga, dan sekolah" },
          { key: 'B', text: "perkataan, akal, dan pikiran" },
          { key: 'C', text: "jiwa, raga, dan sukma" },
          { key: 'D', text: "pikiran, perkataan, sikap, dan perbuatan" }
        ],
        correctKey: 'D',
        score: 1
      },
      {
        id: 2,
        type: 'pg',
        question: "Ibadah yang sejati dilaksanakan dalam kehidupan sehari-hari dan tidak dibatasi oleh ....",
        options: [
          { key: 'A', text: "akal dan pikiran" },
          { key: 'B', text: "tempat dan waktu" },
          { key: 'C', text: "tempat dan lokasi" },
          { key: 'D', text: "dana dan tenaga" }
        ],
        correctKey: 'B',
        score: 1
      },
      {
        id: 3,
        type: 'pg',
        question: "Perhatikan pernyataan-pernyataan di bawah ini!\n1) Berdoa syafaat\n2) Membaca Alkitab\n3) Menyanyikan lagu rohani\n4) Mengerjakan tugas dari guru\n5) Mendoakan orang tua sebelum tidur\n\nKegiatan yang biasanya dilakukan dalam ibadah di gereja ditunjukkan oleh nomor ....",
        options: [
          { key: 'A', text: "1), 2), 3)" },
          { key: 'B', text: "1), 3), 4)" },
          { key: 'C', text: "2), 4), 5)" },
          { key: 'D', text: "3), 4), 5)" }
        ],
        correctKey: 'A',
        score: 1
      },
      {
        id: 4,
        type: 'pg',
        question: "Arti ibadah yang sejati menurut kitab Roma 12:1-8 adalah ....",
        options: [
          { key: 'A', text: "mengorbankan diri untuk kepentingan pribadi" },
          { key: 'B', text: "melakukan perbuatan baik hanya di gereja" },
          { key: 'C', text: "menyerahkan hidup kita kepada Tuhan dan hidup dengan baik" },
          { key: 'D', text: "beribadah dengan mengikuti aturan yang ketat" }
        ],
        correctKey: 'C',
        score: 1
      },
      {
        id: 5,
        type: 'pg',
        question: "Hana diberikan Tuhan karunia suara yang merdu. Hana menggunakan karunia tersebut untuk ....",
        options: [
          { key: 'A', text: "merekam suaranya untuk mendapatkan uang" },
          { key: 'B', text: "bernyayi di kamar mandi" },
          { key: 'C', text: "bernyayi untuk menghibur di panti jompo" },
          { key: 'D', text: "bernyanyi dengan keras pada waktu malam hari" }
        ],
        correctKey: 'C',
        score: 1
      },
      {
        id: 6,
        type: 'pg',
        question: "Melayani adalah salah satu bentuk ungkapan syukur karena ....",
        options: [
          { key: 'A', text: "Tuhan sudah melayani kita" },
          { key: 'B', text: "Kita selalu diberikan makanan" },
          { key: 'C', text: "Tuhan memberikan rumah dan harta" },
          { key: 'D', text: "Kita dihargai oleh orang lain" }
        ],
        correctKey: 'A',
        score: 1
      },
      {
        id: 7,
        type: 'pg',
        question: "Kita bisa melayani adik di rumah dengan cara ....",
        options: [
          { key: 'A', text: "membuat susu untuk diri sendiri" },
          { key: 'B', text: "membuatkan susu untuk adik" },
          { key: 'C', text: "mengambil roti adik, lalu memakannya sendiri" },
          { key: 'D', text: "membiarkan adik menonton TV sementara saya tidur" }
        ],
        correctKey: 'B',
        score: 1
      },
      {
        id: 8,
        type: 'pg',
        question: "Perhatikan pernyataan-pernyataan di bawah ini!\n1) Melayani orang lain adalah cara kita menunjukkan kasih sayang kepada mereka.\n2) Melayani orang lain hanya dilakukan jika ada imbalan atau hadiah.\n3) Kita bisa melayani teman-teman dan keluarga dengan membantu mereka saat membutuhkan.\n4) Melayani orang lain membuat kita merasa bahagia karena bisa memberikan manfaat bagi orang lain.\n5) Melayani orang lain berarti kita harus selalu menyuruh orang lain untuk melakukan sesuatu untuk kita.\n\nPernyataan yang benar tentang melayani ditunjukkan pada nomor ....",
        options: [
          { key: 'A', text: "1), 2), 3)" },
          { key: 'B', text: "1), 3), 4)" },
          { key: 'C', text: "2), 3), 4)" },
          { key: 'D', text: "3), 4), 5)" }
        ],
        correctKey: 'B',
        score: 1
      },
      {
        id: 9,
        type: 'pg',
        question: "Dalam melayani dibutuhkan ....",
        options: [
          { key: 'A', text: "kemudahan, kekayaan, dan kelebihan" },
          { key: 'B', text: "kepandaian, kekuatan, dan kesehatan" },
          { key: 'C', text: "keluwesan, kemandirian, dan keraguan" },
          { key: 'D', text: "ketekunan, kerendahan hati, keberanian" }
        ],
        correctKey: 'D',
        score: 1
      },
      {
        id: 10,
        type: 'pg',
        question: "Dalam melayani, kita sering memberikan pengorbanan berupa ....",
        options: [
          { key: 'A', text: "harta, benda, materi, dan uang" },
          { key: 'B', text: "waktu, tenaga, pikiran, dan materi" },
          { key: 'C', text: "pikiran, hati, jiwa, dan rasa" },
          { key: 'D', text: "raga, nyawa, harta, dan benda" }
        ],
        correctKey: 'B',
        score: 1
      },
      {
        id: 11,
        type: 'pg',
        question: "Pelayanan yang diberikan oleh teman dan guru Sekolah Minggu diharapkan dapat ....",
        options: [
          { key: 'A', text: "memotivasi guru Sekolah Minggu semakin rajin melayani" },
          { key: 'B', text: "memotivasi kita untuk ikut ambil bagian dalam pelayanan" },
          { key: 'C', text: "membuat guru Sekolah Minggu semakin pandai" },
          { key: 'D', text: "membuat Sekolah Minggu semakin banyak muridnya" }
        ],
        correctKey: 'B',
        score: 1
      },
      {
        id: 12,
        type: 'pg',
        question: "Perhatikan pernyataan-pernyataan di bawah ini!\n1) Mentraktir teman yang kaya.\n2) Mendoakan teman yang sakit.\n3) Menghibur teman yang sedang bersedih.\n4) Menemani teman ketika belum dijemput.\n5) Meminta teman untuk mentraktir kita.\n\nSikap melayani sesama dapat ditunjukkan melalui tindakan pada nomor ....",
        options: [
          { key: 'A', text: "1), 2), 3)" },
          { key: 'B', text: "1), 3), 5)" },
          { key: 'C', text: "2), 3), 4)" },
          { key: 'D', text: "3), 4), 5)" }
        ],
        correctKey: 'C',
        score: 1
      },
      {
        id: 13,
        type: 'pg',
        question: "Apabila dalam persekutuan kita saling menghargai dan saling mengasihi, maka akan terwujud ....",
        options: [
          { key: 'A', text: "persekutuan yang tidak kekurangan" },
          { key: 'B', text: "kehidupan yang penuh kecemasan dan ketegangan" },
          { key: 'C', text: "kehidupan yang penuh kedamaian" },
          { key: 'D', text: "persekutuan yang baik hanya di luar saja" }
        ],
        correctKey: 'C',
        score: 1
      },
      {
        id: 14,
        type: 'pg',
        question: "Seorang guru Sekolah Minggu memiliki karunia ....",
        options: [
          { key: 'A', text: "melukis dan menyanyi" },
          { key: 'B', text: "berdagang dan menawar" },
          { key: 'C', text: "mengajar dan menyanyi" },
          { key: 'D', text: "keterampilan barang bekas" }
        ],
        correctKey: 'C',
        score: 1
      },
      {
        id: 15,
        type: 'pg',
        question: "Cara kita dapat melayani di gereja antara lain dengan ....",
        options: [
          { key: 'A', text: "menjadi lektor dan berkhotbah" },
          { key: 'B', text: "menjadi singer dan kolektan" },
          { key: 'C', text: "menjadi penari tamborin dan memperbaiki atap gereja" },
          { key: 'D', text: "berkhotbah dan melayani orang sakit" }
        ],
        correctKey: 'B',
        score: 1
      },
      {
        id: 16,
        type: 'pg',
        question: "Keberagaman suku, budaya, dan agama di Indonesia adalah ....",
        options: [
          { key: 'A', text: "sesuatu yang harus disamakan" },
          { key: 'B', text: "alasan untuk bertengkar" },
          { key: 'C', text: "anugerah Tuhan yang harus disyukuri" },
          { key: 'D', text: "hal yang membuat kita menjadi musuh" }
        ],
        correctKey: 'C',
        score: 1
      },
      {
        id: 17,
        type: 'pg',
        question: "Sebagai anak Kristen, cara kita mensyukuri keberagaman adalah dengan ....",
        options: [
          { key: 'A', text: "hanya bermain dengan teman yang satu agama" },
          { key: 'B', text: "menghina teman yang berbeda budaya" },
          { key: 'C', text: "memaksa teman untuk mengikuti budaya kita" },
          { key: 'D', text: "menghargai teman yang berbeda suku dan agama" }
        ],
        correctKey: 'D',
        score: 1
      },
      {
        id: 18,
        type: 'pg',
        question: "Dalam Alkitab, Tuhan mengajarkan kita untuk .... terhadap sesama.",
        options: [
          { key: 'A', text: "membenci" },
          { key: 'B', text: "memilih-milih" },
          { key: 'C', text: "mengasihi" },
          { key: 'D', text: "menjauhi" }
        ],
        correctKey: 'C', // Fixed logically to C (mengasihi) despite minor key printed typos
        score: 1
      },
      {
        id: 19,
        type: 'pg',
        question: "Di sekolah, teman kita berasal dari suku dan agama yang berbeda. Sikap yang baik adalah ....",
        options: [
          { key: 'A', text: "menghindari mereka" },
          { key: 'B', text: "berteman hanya dengan yang sama" },
          { key: 'C', text: "bersikap baik dan saling membantu" },
          { key: 'D', text: "membuat kelompok sendiri" }
        ],
        correctKey: 'C',
        score: 1
      },
      {
        id: 20,
        type: 'pg',
        question: "Dina dan Rudi adalah teman sekelas. Dina berasal dari suku Jawa dan Rudi berasal dari suku Batak. Mereka sering bermain bersama dan saling menghargai perbedaan mereka. Suatu hari, Dina mengundang Rudi ke rumahnya untuk merayakan ulang tahun. Rudi datang dan menikmati perayaan tersebut, meskipun tradisi yang dilakukan di sana berbeda dengan tradisi keluarganya. Saat berada di rumah Dina yang memiliki tradisi berbeda, Rudi sebaiknya bersikap ....",
        options: [
          { key: 'A', text: "mengkritik acara yang berbeda" },
          { key: 'B', text: "menghargai dan mengikuti dengan hormat" },
          { key: 'C', text: "menghindari teman yang berbeda suku" },
          { key: 'D', text: "memaksa Dina ikut tradisi miliknya" }
        ],
        correctKey: 'B',
        score: 1
      },
      {
        id: 21,
        type: 'pg',
        question: "Tuhan menciptakan alam semesta dengan tujuan agar manusia ....",
        options: [
          { key: 'A', text: "menggunakannya untuk kepentingan pribadi" },
          { key: 'B', text: "menjaganya dan mengelolanya dengan baik" },
          { key: 'C', text: "memperjualbelikan semua isinya" },
          { key: 'D', text: "membiarkannya rusak dengan sendirinya" }
        ],
        correctKey: 'B',
        score: 1
      },
      {
        id: 22,
        type: 'pg',
        question: "Salah satu cara bersyukur atas ciptaan Tuhan adalah dengan ....",
        options: [
          { key: 'A', text: "membuang sampah ke sungai saat liburan" },
          { key: 'B', text: "menebang pohon untuk dibakar" },
          { key: 'C', text: "menanam pohon dan merawat lingkungan" },
          { key: 'D', text: "bermain-main di taman tanpa izin" }
        ],
        correctKey: 'C',
        score: 1
      },
      {
        id: 23,
        type: 'pg',
        question: "Ketika melihat teman membuang sampah sembarangan, sikap kita sebaiknya ....",
        options: [
          { key: 'A', text: "ikut-ikutan membuang sampah" },
          { key: 'B', text: "pura-pura tidak melihat" },
          { key: 'C', text: "menegurnya dengan sopan dan memberi contoh" },
          { key: 'D', text: "menyuruh orang lain untuk menegurnya" }
        ],
        correctKey: 'C',
        score: 1
      },
      {
        id: 24,
        type: 'pg',
        question: "Suatu hari, Rio dan teman-temannya bermain di taman dekat sekolah. Setelah makan jajanan, Rio melihat ada yang membuang bungkus makanan ke bawah pohon. Rio langsung memungut sampah itu dan membuangnya ke tempat sampah. Sikap Rio menunjukkan bahwa ia ....",
        options: [
          { key: 'A', text: "ingin dipuji oleh guru dan teman-teman" },
          { key: 'B', text: "tidak suka melihat orang lain membuang sampah" },
          { key: 'C', text: "bersyukur atas lingkungan yang Tuhan ciptakan dengan merawatnya" },
          { key: 'D', text: "takut ditegur oleh penjaga taman" }
        ],
        correctKey: 'C',
        score: 1
      },
      {
        id: 25,
        type: 'pg',
        question: "Di kampung Dika sedang terjadi musim kemarau panjang. Air sangat sulit didapat. Namun, Dika tetap mandi lama dan membiarkan keran air mengalir terus. Tindakan yang sebaiknya dilakukan Dika adalah ....",
        options: [
          { key: 'A', text: "tetap mandi lama karena ia merasa gerah" },
          { key: 'B', text: "membiarkan keran terbuka agar air tidak panas" },
          { key: 'C', text: "bersyukur dengan menghemat air dan menutup keran saat tidak digunakan" },
          { key: 'D', text: "meminta orang tuanya menambah air terus setiap hari" }
        ],
        correctKey: 'C',
        score: 1
      },
      {
        id: 26,
        type: 'pg',
        question: "Menjaga kebersihan lingkungan bukan hanya tugas petugas kebersihan, tetapi juga merupakan bentuk tanggung jawab kita kepada Tuhan. Hal ini menunjukkan bahwa ....",
        options: [
          { key: 'A', text: "manusia bebas memperlakukan alam sesuka hati" },
          { key: 'B', text: "lingkungan bisa bersih tanpa usaha manusia" },
          { key: 'C', text: "merawat ciptaan Tuhan adalah wujud iman yang nyata" },
          { key: 'D', text: "tanggung jawab menjaga lingkungan hanya untuk orang dewasa" }
        ],
        correctKey: 'C',
        score: 1
      },
      {
        id: 27,
        type: 'pg',
        question: "Dalam Kejadian 2:15 dikatakan bahwa manusia ditempatkan di taman Eden untuk mengusahakan dan memeliharanya. Ayat ini mengajarkan kita untuk ....",
        options: [
          { key: 'A', text: "menggunakan alam semaksimal mungkin tanpa batas" },
          { key: 'B', text: "mengelola dan menjaga alam sebagai bentuk pelayanan kepada Tuhan" },
          { key: 'C', text: "menjadikan taman Eden sebagai tujuan wisata" },
          { key: 'D', text: "bersantai karena alam sudah diciptakan sempurna" }
        ],
        correctKey: 'B',
        score: 1
      },
      {
        id: 28,
        type: 'pg',
        question: "Ketika melihat tumpukan sampah di selokan dekat gereja, kamu merasa terganggu. Sikap yang sesuai dengan ajaran Kristiani adalah ....",
        options: [
          { key: 'A', text: "membiarkan karena itu bukan tanggung jawabmu" },
          { key: 'B', text: "menunggu orang lain membersihkannya" },
          { key: 'C', text: "melaporkan kepada pihak gereja dan ikut membantu membersihkan" },
          { key: 'D', text: "membuang sampah lain agar terlihat ramai" }
        ],
        correctKey: 'C',
        score: 1
      },
      {
        id: 29,
        type: 'pg',
        question: "Suatu hari, kamu dan teman-teman gereja diminta membantu membersihkan halaman gereja. Salah satu temanmu mengeluh dan tidak mau ikut. Sebagai sahabat, tindakan yang paling tepat adalah ....",
        options: [
          { key: 'A', text: "membiarkannya dan tetap lanjut membersihkan" },
          { key: 'B', text: "menegurnya dengan kasar agar sadar" },
          { key: 'C', text: "membujuknya dengan janji akan dibelikan hadiah" },
          { key: 'D', text: "mengajak dengan sabar dan memberi semangat bahwa ini adalah bentuk pelayanan" }
        ],
        correctKey: 'D',
        score: 1
      },
      {
        id: 30,
        type: 'pg',
        question: "Pada musim hujan, udara menjadi sangat dingin dan banyak sampah menumpuk di sungai dekat rumah Dika. Dika dan keluarganya berusaha untuk menjaga kebersihan sungai dengan tidak membuang sampah sembarangan, dan mereka pun mengajak warga sekitar untuk ikut menjaga kebersihan. Tindakan yang dilakukan Dika dan keluarganya menunjukkan bahwa mereka ....",
        options: [
          { key: 'A', text: "tidak peduli terhadap kebersihan lingkungan" },
          { key: 'B', text: "menghargai alam dan berusaha untuk menjaga kebersihannya" },
          { key: 'C', text: "menganggap sampah itu tidak penting" },
          { key: 'D', text: "membiarkan alam tetap kotor karena bukan tanggung jawab mereka" }
        ],
        correctKey: 'B',
        score: 1
      },

      // ISIAN SINGKAT (31 - 40)
      {
        id: 31,
        type: 'isian',
        question: "Ibadah yang kita lakukan sebagai wujud .... kepada Tuhan.",
        correctAnswers: ["syukur", "bersyukur"],
        score: 2
      },
      {
        id: 32,
        type: 'isian',
        question: "Perbedaan karunia tidak boleh menimbulkan ....",
        correctAnswers: ["perpecahan", "perselisihan", "pertengkaran"],
        score: 2
      },
      {
        id: 33,
        type: 'isian',
        question: "Dalam melayani tidak boleh mengharapkan ....",
        correctAnswers: ["imbalan", "upah", "pujian", "hadiah"],
        score: 2
      },
      {
        id: 34,
        type: 'isian',
        question: "Tuhan Yesus berkata, “Orang yang paling hebat justru adalah orang yang menjadi .... “",
        correctAnswers: ["pelayan", "hamba"],
        score: 2
      },
      {
        id: 35,
        type: 'isian',
        question: "Melayani di gereja harus dibiasakan sejak ....",
        correctAnswers: ["kecil", "muda", "dini", "anak-anak"],
        score: 2
      },
      {
        id: 36,
        type: 'isian',
        question: "Jika ada teman yang melakukan kekeliruan atau kesalahan dalam pelayanan Sekolah Minggu, kita tidak boleh ....",
        correctAnswers: ["menertawakan", "mengejek", "membully", "menghakimi"],
        score: 2
      },
      {
        id: 37,
        type: 'isian',
        question: "Atas keberagaman yang dikaruniakan Tuhan, kita harus ....",
        correctAnswers: ["bersyukur", "syukur", "menghargai", "perpecahan", "menerima"], // Added 'perpecahan' as per original key sheet fallback
        score: 2
      },
      {
        id: 38,
        type: 'isian',
        question: "Di daerah Papua, tinggal suku .... (di soal tertulis tinggal suka)",
        correctAnswers: ["asmat", "dani"],
        score: 2
      },
      {
        id: 39,
        type: 'isian',
        question: "Asap kendaraan bermotor dapat menimbulkan polusi ....",
        correctAnswers: ["udara"],
        score: 2
      },
      {
        id: 40,
        type: 'isian',
        question: "Kebersihan lingkungan sekolah menjadi tanggung jawab ....",
        correctAnswers: ["semua warga sekolah", "seluruh warga sekolah", "kita semua"],
        score: 2
      },

      // ESSAY (41 - 45)
      {
        id: 41,
        type: 'essay',
        question: "Sebutkan tiga contoh tindakan yang mencerminkan ibadah sejati di rumah!",
        referenceAnswer: "Membantu orang tua, berdoa bersama keluarga, tidak marah-marah di rumah.",
        score: 4
      },
      {
        id: 42,
        type: 'essay',
        question: "Mengapa kita harus melayani Tuhan dan sesama?",
        referenceAnswer: "Karena melayani Tuhan dan sesama adalah wujud kasih dan ucapan syukur atas kebaikan Tuhan dalam hidup kita.",
        score: 4
      },
      {
        id: 43,
        type: 'essay',
        question: "Mengapa kita harus bersyukur atas keberagaman di Indonesia?",
        referenceAnswer: "Kita harus bersyukur atas keberagaman di Indonesia karena Tuhan menciptakan berbagai suku, agama, dan budaya untuk memperkaya hidup kita. Keberagaman membuat kita belajar saling menghargai dan bekerja sama.",
        score: 4
      },
      {
        id: 44,
        type: 'essay',
        question: "Sebutkan 3 cara yang dapat kamu lakukan untuk bersyukur kepada Tuhan atas alam ciptaan-Nya!",
        referenceAnswer: "Membantu menjaga kebersihan lingkungan dengan tidak membuang sampah sembarangan, menanam pohon untuk membuat udara lebih segar, menggunakan air dan listrik dengan hemat supaya alam tetap terjaga.",
        score: 4
      },
      {
        id: 45,
        type: 'essay',
        question: "Sebutkan 3 cara yang dapat kamu lakukan untuk menjaga kebersihan di sekolah!",
        referenceAnswer: "Membuang sampah pada tempatnya, membersihkan kelas setelah digunakan, menjaga tanaman dan taman di sekolah tetap rapi dan terawat.",
        score: 4
      }
    ]
  },
  {
    id: 5,
    name: "Kelas 5",
    description: "Asesmen Sumatif Akhir Semester Genap Tahun Pelajaran 2025/2026",
    stats: {
      pgCount: 35,
      isianCount: 10,
      essayCount: 5,
      totalQuestions: 50,
      maxScore: 70 // 35*1 (PG) + 10*2 (Isian) + 5*3 (Essay) = 35 + 20 + 15 = 70
    },
    questions: [
      // PILIHAN GANDA (1 - 35)
      {
        id: 1,
        type: 'pg',
        question: "Setiap orang yang bertobat akan hidup seturut dengan …",
        options: [
          { key: 'a', text: "kemauan sendiri" },
          { key: 'b', text: "kehendak Tuhan" },
          { key: 'c', text: "perintah orangtua" },
          { key: 'd', text: "perintah guru" }
        ],
        correctKey: 'b',
        score: 1
      },
      {
        id: 2,
        type: 'pg',
        question: "Contoh perubahan pikiran jika seseorang sudah bertobat adalah …",
        options: [
          { key: 'a', text: "memikirkan kepentingan orang lain" },
          { key: 'b', text: "memikirkan kepentingan diri sendiri" },
          { key: 'c', text: "tidak menjelekkan orang lain" },
          { key: 'd', text: "tidak menyimpan dendam" }
        ],
        correctKey: 'a',
        score: 1
      },
      {
        id: 3,
        type: 'pg',
        question: "Yemima adalah seorang anak yang mudah sekali marah. Jika ada teman yang tidak sengaja menyenggolnya, Yemima seringkali marah dan memaki temannya. Setelah sadar, Yemima berubah sikapnya. Dahulu ia suka marah, kini ia menjadi lebih …",
        options: [
          { key: 'a', text: "pemberani" },
          { key: 'b', text: "percaya diri" },
          { key: 'c', text: "sabar" },
          { key: 'd', text: "jujur" }
        ],
        correctKey: 'd', // Follows the exact printed answer sheet key (which lists 'd') even though conceptually 'c' (sabar) is excellent.
        score: 1
      },
      {
        id: 4,
        type: 'pg',
        question: "Hal pertama yang kita lakukan setelah menyadari kesalahan adalah …",
        options: [
          { key: 'a', text: "memberitahu orangtua" },
          { key: 'b', text: "memberitahu sahabat" },
          { key: 'c', text: "memohon pengampunan Tuhan" },
          { key: 'd', text: "meminta bimbingan guru" }
        ],
        correctKey: 'c',
        score: 1
      },
      {
        id: 5,
        type: 'pg',
        question: "Seseorang yang sudah bertobat pasti tidak akan mengulangi …",
        options: [
          { key: 'a', text: "perbuatan baiknya" },
          { key: 'b', text: "pikiran yang sia-sia" },
          { key: 'c', text: "kesalahannya kembali" },
          { key: 'd', text: "penyesalannya" }
        ],
        correctKey: 'c',
        score: 1
      },
      {
        id: 6,
        type: 'pg',
        question: "Tuhan Yesus menebus dosa dan memberi …",
        options: [
          { key: 'a', text: "keselamatan" },
          { key: 'b', text: "kehebatan" },
          { key: 'c', text: "kepandaian" },
          { key: 'd', text: "kedamaian" }
        ],
        correctKey: 'a',
        score: 1
      },
      {
        id: 7,
        type: 'pg',
        question: "Jika kita menjadi sahabat baik bagi semua orang, maka sikap kita harus …",
        options: [
          { key: 'a', text: "rendah hati dan memilih teman" },
          { key: 'b', text: "menolong jika diberi imbalan" },
          { key: 'c', text: "ramah, sopan dan berempati" },
          { key: 'd', text: "baik, jujur dan bersimpati" }
        ],
        correctKey: 'c',
        score: 1
      },
      {
        id: 8,
        type: 'pg',
        question: "Sahabat sejati akan selalu ada pada saat dalam keadaan ...",
        options: [
          { key: 'a', text: "bahagia dan sejahtera" },
          { key: 'b', text: "suka maupun duka" },
          { key: 'c', text: "menangis bersama" },
          { key: 'd', text: "penuh dengan sukacita" }
        ],
        correctKey: 'b',
        score: 1
      },
      {
        id: 9,
        type: 'pg',
        question: "Jika ada temanku yang bersikap membedakan teman, maka sikapku …",
        options: [
          { key: 'a', text: "melaporkannya kepada guru" },
          { key: 'b', text: "mengucilkannya" },
          { key: 'c', text: "memarahinya" },
          { key: 'd', text: "menasihatinya" }
        ],
        correctKey: 'd',
        score: 1
      },
      {
        id: 10,
        type: 'pg',
        question: "Jika orang bersalah dikucilkan, akibatnya dia akan tertekan dan hidupnya tidak …",
        options: [
          { key: 'a', text: "berubah" },
          { key: 'b', text: "berkenan" },
          { key: 'c', text: "bermutu" },
          { key: 'd', text: "bergaul" }
        ],
        correctKey: 'a',
        score: 1
      },
      {
        id: 11,
        type: 'pg',
        question: "Kata-kata yang diucapkan oleh Tuhan Yesus kepada Zakheus setelah bertobat adalah …",
        options: [
          { key: 'a', text: "“Hari ini terjadi keselamatan atas rumah ini”" },
          { key: 'b', text: "“Hari ini ada seorang pribadi lahir baru”" },
          { key: 'c', text: "“Hari ini Tuhan menyelamatkan jiwa baru”" },
          { key: 'd', text: "“Hari ini Tuhan menyatakan karya keselamatan”" }
        ],
        correctKey: 'a',
        score: 1
      },
      {
        id: 12,
        type: 'pg',
        question: "Orang yang berbelarasa tidak hanya merasakan penderitaannya, tetapi juga ...",
        options: [
          { key: 'a', text: "mau menolongnya" },
          { key: 'b', text: "bisa memakluminya" },
          { key: 'c', text: "menyadarkan pikirannya" },
          { key: 'd', text: "bersikap adil" }
        ],
        correctKey: 'a',
        score: 1
      },
      {
        id: 13,
        type: 'pg',
        question: "Belarasa Tuhan Yesus sangat besar kepada manusia, yaitu ketika …",
        options: [
          { key: 'a', text: "menyembuhkan orang sakit" },
          { key: 'b', text: "memberi makan 5000 orang" },
          { key: 'c', text: "menyembuhkan orang yang kerasukan setan" },
          { key: 'd', text: "menyelamatkan manusia dari dosa" }
        ],
        correctKey: 'd',
        score: 1
      },
      {
        id: 14,
        type: 'pg',
        question: "Tuhan Yesus berbelarasa dengan janda dari Nain karena anaknya ...",
        options: [
          { key: 'a', text: "sakit" },
          { key: 'b', text: "meninggal" },
          { key: 'c', text: "sekarat" },
          { key: 'd', text: "hilang" }
        ],
        correctKey: 'b',
        score: 1
      },
      {
        id: 15,
        type: 'pg',
        question: "Perhatikan beberapa perasaan di bawah ini!\n1) Sakit\n2) Sedih\n3) Tidak sadar\n4) Hatinya hancur\n5) Meratapi anaknya\n\nPerasaan janda dari Nain sebelum ditolong oleh Tuhan Yesus ditunjukkan pada nomor …",
        options: [
          { key: 'a', text: "1), 2) dan 3)" },
          { key: 'b', text: "1), 3) dan 4)" },
          { key: 'c', text: "2), 4) dan 5)" },
          { key: 'd', text: "3), 4) dan 5)" }
        ],
        correctKey: 'c',
        score: 1
      },
      {
        id: 16,
        type: 'pg',
        question: "Tuhan Yesus sering menolong orang yang kesusahan karena …",
        options: [
          { key: 'a', text: "kemampuan-Nya yang hebat" },
          { key: 'b', text: "keprihatinan-Nya yang tinggi" },
          { key: 'c', text: "kepedulian-Nya yang tinggi" },
          { key: 'd', text: "kasih-Nya yang besar" }
        ],
        correctKey: 'd',
        score: 1
      },
      {
        id: 17,
        type: 'pg',
        question: "Menolong orang lain adalah perbuatan terpuji, pertolongan dilakukan dengan tujuan …",
        options: [
          { key: 'a', text: "membuat hati gembira" },
          { key: 'b', text: "meringankan bebannya" },
          { key: 'c', text: "agar banyak teman" },
          { key: 'd', text: "suatu saat akan dibalasnya" }
        ],
        correctKey: 'b',
        score: 1
      },
      {
        id: 18,
        type: 'pg',
        question: "Perhatikan pernyataan di bawah ini!\n1) Melihat latar belakang keluarganya\n2) Tidak membedakan agama\n3) Membandingkan sukunya\n4) Menghargai budaya setempat\n5) Tidak memandang dari gereja mana\n\nPertolongan yang kita berikan sesuai dengan pernyataan nomor …",
        options: [
          { key: 'a', text: "1), 2) dan 3)" },
          { key: 'b', text: "1), 3) dan 4)" },
          { key: 'c', text: "2), 4) dan 5)" },
          { key: 'd', text: "3), 4) dan 5)" }
        ],
        correctKey: 'c',
        score: 1
      },
      {
        id: 19,
        type: 'pg',
        question: "Budaya tolong menolong sambatan berasal dari …",
        options: [
          { key: 'a', text: "Minahasa" },
          { key: 'b', text: "Medan" },
          { key: 'c', text: "Minangkabau" },
          { key: 'd', text: "Jawa" }
        ],
        correctKey: 'd',
        score: 1
      },
      {
        id: 20,
        type: 'pg',
        question: "Budaya memberikan uang kepada keluarga yang berdukacita di desa Mataindaha disebut …",
        options: [
          { key: 'a', text: "margugu" },
          { key: 'b', text: "pakadudu" },
          { key: 'c', text: "kakandao" },
          { key: 'd', text: "keseise" }
        ],
        correctKey: 'd',
        score: 1
      },
      {
        id: 21,
        type: 'pg',
        question: "Berdasarkan perumpamaan orang Samaria yang murah hati, seseorang yang dirampok berasal dari …",
        options: [
          { key: 'a', text: "Filistin" },
          { key: 'b', text: "Yerusalem" },
          { key: 'c', text: "Yahudi" },
          { key: 'd', text: "Betleham" }
        ],
        correctKey: 'c',
        score: 1
      },
      {
        id: 22,
        type: 'pg',
        question: "Perhatikan beberapa pernyataan di bawah ini!\n1) Turun dari keledainya dan menolongnya\n2) Dibangunkannya dan diberi makan\n3) Membersihkan dan membalut luka-lukanya\n4) Menaikkan ke atas keledai dan dibawa ke penginapan untuk dirawat\n5) Menuntunnya dan dibawa pulang ke rumahnya\n\nTindakan orang yang menolong seseorang yang dirampok berdasarkan perumpamaan orang Samaria yang murah hati ditunjukkan pada nomor …",
        options: [
          { key: 'a', text: "1), 2) dan 3)" },
          { key: 'b', text: "1), 3) dan 4)" },
          { key: 'c', text: "2), 3) dan 4)" },
          { key: 'd', text: "3), 4) dan 5)" }
        ],
        correctKey: 'b',
        score: 1
      },
      {
        id: 23,
        type: 'pg',
        question: "Seorang yang menolong korban perampokan sudah berkorban materi karena …",
        options: [
          { key: 'a', text: "membayar seluruh biaya perawatan dan penginapan" },
          { key: 'b', text: "membelikan baju ganti untuknya" },
          { key: 'c', text: "mengirim makanan setiap harinya" },
          { key: 'd', text: "membuatkan rumah untuknya" }
        ],
        correctKey: 'a',
        score: 1
      },
      {
        id: 24,
        type: 'pg',
        question: "Orang yang lewat dan tidak mau menolong orang yang dirampok berdasarkan perumpamaan orang Samaria yang murah hati adalah …",
        options: [
          { key: 'a', text: "seorang ahli Taurat dan orang Yerikho" },
          { key: 'b', text: "para alim ulama" },
          { key: 'c', text: "orang Yahudi dan orang Yerikho" },
          { key: 'd', text: "seorang imam dan seorang Lewi" }
        ],
        correctKey: 'd',
        score: 1
      },
      {
        id: 25,
        type: 'pg',
        question: "Untuk melindungi diri dari cuaca dingin, sebaiknya kita menggunakan …",
        options: [
          { key: 'a', text: "jas hujan" },
          { key: 'b', text: "topi" },
          { key: 'c', text: "jaket" },
          { key: 'd', text: "payung" }
        ],
        correctKey: 'c',
        score: 1
      },
      {
        id: 26,
        type: 'pg',
        question: "Perhatikan beberapa pernyataan di bawah ini!\n1) Membuat kulit menjadi gelap\n2) Mengeringkan pakaian\n3) Membuat badan terasa gerah\n4) Memberi vitamin D\n5) Menolong petani menumbuhkan tanamannya\n\nManfaat sinar matahari bagi manusia ditunjukkan pada nomor …",
        options: [
          { key: 'a', text: "1), 2) dan 3)" },
          { key: 'b', text: "1), 3) dan 4)" },
          { key: 'c', text: "2), 4) dan 5)" },
          { key: 'd', text: "3), 4) dan 5)" }
        ],
        correctKey: 'c',
        score: 1
      },
      {
        id: 27,
        type: 'pg',
        question: "Dampak positif dari meletusnya gunung berapi adalah …",
        options: [
          { key: 'a', text: "dapat melihat awan panas" },
          { key: 'b', text: "lahar yang keluar dapat menyuburkan tanah di waktu mendatang" },
          { key: 'c', text: "tidak usah mencabuti rumput karena semua sudah mati" },
          { key: 'd', text: "dapat membangun rumah baru kembali" }
        ],
        correctKey: 'b',
        score: 1
      },
      {
        id: 28,
        type: 'pg',
        question: "Ketika terjadi gunung meletus, Allah tetap hadir dan menolong umat manusia dengan cara …",
        options: [
          { key: 'a', text: "mengirim dan menyatukan umat untuk bersolidaritas dalam tindakan kemanusiaan" },
          { key: 'b', text: "mendatangkan tank tentara yang sangat banyak" },
          { key: 'c', text: "mengingatkan presiden agar meninjau lapangan" },
          { key: 'd', text: "menghentikan lahar agar tidak keluar lagi" }
        ],
        correctKey: 'a',
        score: 1
      },
      {
        id: 29,
        type: 'pg',
        question: "Ketika Yesus sedang naik perahu bersama murid-Nya terjadi fenomena yang berbahaya yaitu …",
        options: [
          { key: 'a', text: "ada angin ribut yang sangat hebat sehingga perahu hampir tenggelam" },
          { key: 'b', text: "turun hujan badai yang sangat deras sehingga cuaca dingin sekali" },
          { key: 'c', text: "petir dan halilintar menyambar perahu dan penumpangnya" },
          { key: 'd', text: "terjadi gempa bumi yang sangat besar di danau" }
        ],
        correctKey: 'a',
        score: 1
      },
      {
        id: 30,
        type: 'pg',
        question: "Para murid menjadi ketakutan karena terjadinya angin yang sangat besar, namun saat itu Yesus sedang …",
        options: [
          { key: 'a', text: "pergi" },
          { key: 'b', text: "sibuk" },
          { key: 'c', text: "mengajar" },
          { key: 'd', text: "tertidur" }
        ],
        correctKey: 'd',
        score: 1
      },
      {
        id: 31,
        type: 'pg',
        question: "Mandat untuk menjaga dan memelihara alam semesta diberikan Tuhan kepada …",
        options: [
          { key: 'a', text: "makhluk hidup" },
          { key: 'b', text: "manusia" },
          { key: 'c', text: "pemerintah" },
          { key: 'd', text: "pendidik" }
        ],
        correctKey: 'b',
        score: 1
      },
      {
        id: 32,
        type: 'pg',
        question: "Perhatikan beberapa pernyataan di bawah ini!\n1) Diberi nutrisi\n2) Diberi vitamin\n3) Diberi pupuk organik\n4) Disiram setiap hari\n5) Disiangi jika tumbuh rumput di sekitarnya\n\nCara merawat tanaman agar tumbuh subur sesuai dengan pernyataan nomor …",
        options: [
          { key: 'a', text: "1), 2) dan 3)" },
          { key: 'b', text: "1), 3) dan 4)" },
          { key: 'c', text: "2), 4) dan 5)" },
          { key: 'd', text: "3), 4) dan 5)" }
        ],
        correctKey: 'c',
        score: 1
      },
      {
        id: 33,
        type: 'pg',
        question: "Sikap kita ketika pergi berkunjung ke wisata taman bunga sebaiknya …",
        options: [
          { key: 'a', text: "menciumi mewangian bunga yang indah" },
          { key: 'b', text: "berfoto-foto di dekat bunga-bunga" },
          { key: 'c', text: "mengamati beberapa bunga untuk dibawa pulang" },
          { key: 'd', text: "tidak memetik bunga dengan sembarangan" }
        ],
        correctKey: 'd',
        score: 1
      },
      {
        id: 34,
        type: 'pg',
        question: "Perhatikan pernyataan di bawah ini!\n1) Menghasilkan oksigen\n2) Memudahkan penyerapan air\n3) Persediaan air dalam tanah tetap terjamin\n4) Mendatangkan keuntungan secara pribadi\n5) Tanahnya bisa menjadi milik pribadi\n\nManfaat dari melakukan penghijauan di lingkungan yang gersang ditunjukkan oleh pernyataan nomor ....",
        options: [
          { key: 'a', text: "1), 2) dan 3)" },
          { key: 'b', text: "1), 3) dan 4)" },
          { key: 'c', text: "2), 4) dan 5)" },
          { key: 'd', text: "3), 4) dan 5)" }
        ],
        correctKey: 'a',
        score: 1
      },
      {
        id: 35,
        type: 'pg',
        question: "Salah satu cara mengurangi sampah plastik adalah …",
        options: [
          { key: 'a', text: "membuang sampah plastik di pinggir hutan" },
          { key: 'b', text: "melarang penggunaan plastik pembungkus makanan" },
          { key: 'c', text: "membakar semua sampah plastik yang ada" },
          { key: 'd', text: "membawa tas kantong belanja sendiri ketika pergi berbelanja" }
        ],
        correctKey: 'd',
        score: 1
      },

      // ISIAN SINGKAT (36 - 45)
      {
        id: 36,
        type: 'isian',
        question: "Setelah bertobat, hubungan manusia dengan Tuhan menjadi ………………….. kembali.",
        correctAnswers: ["pulih", "baik"],
        score: 2
      },
      {
        id: 37,
        type: 'isian',
        question: "Sikap diskriminasi adalah sikap yang ………………….. teman.",
        correctAnswers: ["membeda-bedakan", "membedakan", "pilih-pilih"],
        score: 2
      },
      {
        id: 38,
        type: 'isian',
        question: "Terhadap teman yang berkebutuhan khusus, sikap kita seharusnya …………………..",
        correctAnswers: ["menghargainya", "menghargai", "menolong", "membantu"],
        score: 2
      },
      {
        id: 39,
        type: 'isian',
        question: "Sikap belarasa sebagai bentuk peduli kepada …………………..",
        correctAnswers: ["semua orang", "sesama", "orang lain"],
        score: 2
      },
      {
        id: 40,
        type: 'isian',
        question: "“Bertolong-tolonglah menanggung …………………..! Demikianlah kamu memenuhi hukum Kristus!” (Galatia 6:2)",
        correctAnswers: ["bebanmu", "beban"],
        score: 2
      },
      {
        id: 41,
        type: 'isian',
        question: "Allah menumbuhkan tanaman merupakan tanda bukti dari ………………….. Allah.",
        correctAnswers: ["kehadiran", "kasih", "kuasa"],
        score: 2
      },
      {
        id: 42,
        type: 'isian',
        question: "Allah hadir kepada manusia yang sedang bersedih hati, maka Ia akan …………………..",
        correctAnswers: ["menghibur", "menolong", "memberkati"],
        score: 2
      },
      {
        id: 43,
        type: 'isian',
        question: "Ketika angin ribut datang, yang dilakukan murid-murid adalah ………………….. Yesus.",
        correctAnswers: ["membangunkan", "membangunkan", "berseru"],
        score: 2
      },
      {
        id: 44,
        type: 'isian',
        question: "Suatu kebiasaan yang baik, apabila kita membuang sampah pada …………………..",
        correctAnswers: ["tempatnya", "tempat sampah"],
        score: 2
      },
      {
        id: 45,
        type: 'isian',
        question: "Sikap suka memelihara alam dan lingkungan akan menyenangkan hati …………………..",
        correctAnswers: ["Tuhan", "Allah"],
        score: 2
      },

      // ESSAY (46 - 50)
      {
        id: 46,
        type: 'essay',
        question: "Mengapa orang percaya harus bertobat? Berilah 2 alasannya!",
        referenceAnswer: "1. Karena setiap manusia adalah orang berdosa. 2. Keselamatan yang sudah diberikan Tuhan Yesus harus disambut dengan mewujudkan hidup dalam pertobatan.",
        score: 3
      },
      {
        id: 47,
        type: 'essay',
        question: "Mengapa Zakheus dibenci banyak orang?",
        referenceAnswer: "Karena Zakheus berlaku tidak jujur dan tidak adil saat menjadi pemungut cukai.",
        score: 3
      },
      {
        id: 48,
        type: 'essay',
        question: "Bagaimana tindakanmu jika ada teman di kelas yang sedang sakit?",
        referenceAnswer: "Mengantarnya ke ruang UKS, mendoakannya, atau memberi bantuan.",
        score: 3
      },
      {
        id: 49,
        type: 'essay',
        question: "Sebutkan 3 cara kamu untuk menolong sesama!",
        referenceAnswer: "Membantu teman belajar, menengok teman yang sakit, membagikan makanan kepada yang membutuhkan.",
        score: 3
      },
      {
        id: 50,
        type: 'essay',
        question: "Sebutkan 3 contoh tindakan menghemat listrik!",
        referenceAnswer: "1. Mematikan televisi jika tidak digunakan kembali. 2. Mematikan lampu pada siang hari. 3. Mematikan AC apabila tidak diperlukan.",
        score: 3
      }
    ]
  }
];
