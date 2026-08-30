/* ==========================================================================
   data.js — dữ liệu mẫu ban đầu (seed)
   Chỉ là dữ liệu minh hoạ cho phần giao diện, không kết nối máy chủ.
   ========================================================================== */
var SEED = {};

/* ---------------------------------------------------------------- NGƯỜI DÙNG
   2 tài khoản đăng nhập chính — mật khẩu đều là 123456
   -------------------------------------------------------------------------- */
SEED.users = [
  { id:"u2",  email:"gv@hanzi.vn",    pass:"123456", name:"Trần Thị Lan",    role:"gv",
    ini:"TL", color:"#D6453D", phone:"0902 345 678", active:true,  last:"Hôm nay 07:45" },
  { id:"u3",  email:"hv@hanzi.vn",    pass:"123456", name:"Lê Hoàng Nam",    role:"hv",
    ini:"HN", color:"#3B6FD4", phone:"0903 456 789", active:true,  last:"Hôm nay 06:20" },

  { id:"u4",  email:"dat.pham@hanzi.vn", pass:"123456", name:"Phạm Quốc Đạt", role:"gv",
    ini:"QĐ", color:"#E9A23B", phone:"0904 111 222", active:true, last:"Hôm qua 21:30" },

  { id:"u5",  email:"ha.pham@gmail.com",   pass:"123456", name:"Phạm Thu Hà",      role:"hv", ini:"TH", color:"#D6453D", phone:"0905 222 333", active:true,  last:"Hôm qua 21:02" },
  { id:"u6",  email:"minh.vu@gmail.com",   pass:"123456", name:"Vũ Đức Minh",      role:"hv", ini:"ĐM", color:"#2F9E77", phone:"0906 333 444", active:true,  last:"Hôm nay 09:33" },
  { id:"u7",  email:"ngoc.nguyen@gmail.com",pass:"123456",name:"Nguyễn Bảo Ngọc",  role:"hv", ini:"BN", color:"#8B5CF6", phone:"0907 444 555", active:true,  last:"Hôm qua 19:47" },
  { id:"u8",  email:"huy.do@gmail.com",    pass:"123456", name:"Đỗ Quang Huy",     role:"hv", ini:"QH", color:"#E9A23B", phone:"0908 555 666", active:true,  last:"Hôm nay 07:10" },
  { id:"u9",  email:"anh.trinh@gmail.com", pass:"123456", name:"Trịnh Mai Anh",    role:"hv", ini:"MA", color:"#3B6FD4", phone:"0909 666 777", active:true,  last:"Hôm qua 22:55" },
  { id:"u10", email:"son.hoang@gmail.com", pass:"123456", name:"Hoàng Văn Sơn",    role:"hv", ini:"VS", color:"#8B8475", phone:"0910 777 888", active:false, last:"Chưa đăng nhập" },
  { id:"u11", email:"truc.ly@gmail.com",   pass:"123456", name:"Lý Thanh Trúc",    role:"hv", ini:"TT", color:"#2F9E77", phone:"0911 888 999", active:true,  last:"27/08 20:10" },
  { id:"u12", email:"diep.tran@gmail.com", pass:"123456", name:"Trần Ngọc Diệp",   role:"hv", ini:"ND", color:"#2F9E77", phone:"0912 999 000", active:true,  last:"26/08 18:22" },
  { id:"u13", email:"ngocbui@gmail.com",   pass:"123456", name:"Bùi Minh Ngọc",    role:"hv", ini:"MN", color:"#E9A23B", phone:"0913 000 111", active:true,  last:"25/08 20:40" },
  { id:"u14", email:"khanh.le@gmail.com",  pass:"123456", name:"Lê Gia Khánh",     role:"hv", ini:"GK", color:"#8B5CF6", phone:"0914 111 333", active:true,  last:"28/08 21:15" }
];

/* ---------------------------------------------------------------- GIÁO TRÌNH */
SEED.courses = [
  { id:"c1", code:"HSK1-GT", zh:"汉语教程 · 第一册", vi:"Hán ngữ giao tiếp — Tập 1", level:"HSK 1",
    emo:"📗", color:"#D6453D", teacherId:"u2", updated:"20/08/2026",
    desc:"Giáo trình nhập môn theo phong cách 《汉语教程》: mỗi bài gồm 5 phần — khởi động, từ mới, ôn tập, ngữ pháp và hội thoại." },
  { id:"c2", code:"HSK2-GT", zh:"汉语教程 · 第二册", vi:"Hán ngữ giao tiếp — Tập 2", level:"HSK 2",
    emo:"📘", color:"#3B6FD4", teacherId:"u2", updated:"14/08/2026",
    desc:"Tiếp nối tập 1, mở rộng chủ đề mua sắm, thời gian, sức khoẻ và du lịch." },
  { id:"c3", code:"CS-01", zh:"商务汉语", vi:"Tiếng Trung công sở", level:"HSK 3",
    emo:"📙", color:"#E9A23B", teacherId:"u4", updated:"27/08/2026",
    desc:"Giao tiếp nơi làm việc: email, họp, đàm phán, giới thiệu công ty." },
  { id:"c4", code:"HSK3-LT", zh:"HSK 三级冲刺", vi:"Luyện thi HSK 3", level:"HSK 3",
    emo:"📕", color:"#8B5CF6", teacherId:"u4", updated:"02/08/2026",
    desc:"Ôn tập cấp tốc theo cấu trúc đề thi HSK 3." }
];

/* ---------------------------------------------------------------- BÀI HỌC
   Bài 3 có nội dung đầy đủ; các bài khác chỉ có phần đầu (khung).
   -------------------------------------------------------------------------- */
SEED.lessons = [
  { id:"l1", courseId:"c1", no:1, zh:"你叫什么名字", py:"Nǐ jiào shénme míngzi", vi:"Bạn tên là gì?", hv:"nhĩ khiếu thập ma danh tự", emo:"👋",
    vocab:[], extra:[], match:[], sentences:[], grammar:[], dialogues:[] },
  { id:"l2", courseId:"c1", no:2, zh:"你是哪国人", py:"Nǐ shì nǎ guó rén", vi:"Bạn là người nước nào?", hv:"nhĩ thị na quốc nhân", emo:"🌏",
    vocab:[], extra:[], match:[], sentences:[], grammar:[], dialogues:[] },
  { id:"l3", courseId:"c1", no:3, zh:"你做什么工作", py:"Nǐ zuò shénme gōngzuò", vi:"Bạn làm nghề gì?", hv:"nhĩ tố thập ma công tác", emo:"💼",
    vocab:[
      {hz:"工作",py:"gōngzuò",hv:"công tác",pos:"danh từ 名 · động từ 动",vi:"công việc; làm việc",emo:"💼",ex:{zh:"你做什么工作？",py:"Nǐ zuò shénme gōngzuò?",vi:"Bạn làm nghề gì?"}},
      {hz:"做",py:"zuò",hv:"tố",pos:"động từ 动",vi:"làm",emo:"🔨",ex:{zh:"你做什么？",py:"Nǐ zuò shénme?",vi:"Bạn làm gì?"}},
      {hz:"职业",py:"zhíyè",hv:"chức nghiệp",pos:"danh từ 名",vi:"nghề nghiệp",emo:"🧑‍💼",ex:{zh:"你的职业是什么？",py:"Nǐ de zhíyè shì shénme?",vi:"Nghề nghiệp của bạn là gì?"}},
      {hz:"老师",py:"lǎoshī",hv:"lão sư",pos:"danh từ 名",vi:"giáo viên, thầy/cô giáo",emo:"👨‍🏫",ex:{zh:"我是老师。",py:"Wǒ shì lǎoshī.",vi:"Mình là giáo viên."}},
      {hz:"医生",py:"yīshēng",hv:"y sinh",pos:"danh từ 名",vi:"bác sĩ",emo:"🩺",ex:{zh:"我爸爸是医生。",py:"Wǒ bàba shì yīshēng.",vi:"Bố mình là bác sĩ."}},
      {hz:"护士",py:"hùshi",hv:"hộ sĩ",pos:"danh từ 名",vi:"y tá, điều dưỡng",emo:"💉",ex:{zh:"我妈妈是护士。",py:"Wǒ māma shì hùshi.",vi:"Mẹ mình là y tá."}},
      {hz:"工程师",py:"gōngchéngshī",hv:"công trình sư",pos:"danh từ 名",vi:"kỹ sư",emo:"👷",ex:{zh:"他是工程师。",py:"Tā shì gōngchéngshī.",vi:"Anh ấy là kỹ sư."}},
      {hz:"记者",py:"jìzhě",hv:"ký giả",pos:"danh từ 名",vi:"phóng viên, nhà báo",emo:"🎤",ex:{zh:"我是记者。",py:"Wǒ shì jìzhě.",vi:"Mình là phóng viên."}},
      {hz:"律师",py:"lǜshī",hv:"luật sư",pos:"danh từ 名",vi:"luật sư",emo:"⚖️",ex:{zh:"她是律师。",py:"Tā shì lǜshī.",vi:"Cô ấy là luật sư."}},
      {hz:"经理",py:"jīnglǐ",hv:"kinh lý",pos:"danh từ 名",vi:"giám đốc, quản lý",emo:"👔",ex:{zh:"他是公司经理。",py:"Tā shì gōngsī jīnglǐ.",vi:"Anh ấy là giám đốc công ty."}},
      {hz:"司机",py:"sījī",hv:"tư cơ",pos:"danh từ 名",vi:"tài xế, lái xe",emo:"🚕",ex:{zh:"他是司机。",py:"Tā shì sījī.",vi:"Anh ấy là tài xế."}},
      {hz:"服务员",py:"fúwùyuán",hv:"phục vụ viên",pos:"danh từ 名",vi:"nhân viên phục vụ",emo:"🧑‍🍳",ex:{zh:"她是服务员。",py:"Tā shì fúwùyuán.",vi:"Cô ấy là nhân viên phục vụ."}},
      {hz:"警察",py:"jǐngchá",hv:"cảnh sát",pos:"danh từ 名",vi:"cảnh sát",emo:"👮",ex:{zh:"他是警察。",py:"Tā shì jǐngchá.",vi:"Anh ấy là cảnh sát."}},
      {hz:"公司",py:"gōngsī",hv:"công ty",pos:"danh từ 名",vi:"công ty",emo:"🏢",ex:{zh:"我在公司工作。",py:"Wǒ zài gōngsī gōngzuò.",vi:"Mình làm việc ở công ty."}},
      {hz:"医院",py:"yīyuàn",hv:"y viện",pos:"danh từ 名",vi:"bệnh viện",emo:"🏥",ex:{zh:"他在医院工作。",py:"Tā zài yīyuàn gōngzuò.",vi:"Anh ấy làm ở bệnh viện."}},
      {hz:"学校",py:"xuéxiào",hv:"học hiệu",pos:"danh từ 名",vi:"trường học",emo:"🏫",ex:{zh:"她在学校工作。",py:"Tā zài xuéxiào gōngzuò.",vi:"Cô ấy làm ở trường học."}},
      {hz:"银行",py:"yínháng",hv:"ngân hàng",pos:"danh từ 名",vi:"ngân hàng",emo:"🏦",ex:{zh:"我在银行上班。",py:"Wǒ zài yínháng shàngbān.",vi:"Mình đi làm ở ngân hàng."}},
      {hz:"在",py:"zài",hv:"tại",pos:"giới từ 介 · động từ 动",vi:"ở, tại",emo:"📍",ex:{zh:"我在医院工作。",py:"Wǒ zài yīyuàn gōngzuò.",vi:"Mình làm việc ở bệnh viện."}},
      {hz:"上班",py:"shàngbān",hv:"thượng ban",pos:"động từ 动",vi:"đi làm, vào ca",emo:"⏰",ex:{zh:"我每天上班。",py:"Wǒ měitiān shàngbān.",vi:"Ngày nào mình cũng đi làm."}},
      {hz:"下班",py:"xiàbān",hv:"hạ ban",pos:"động từ 动",vi:"tan làm, hết ca",emo:"🌆",ex:{zh:"他下班了。",py:"Tā xiàbān le.",vi:"Anh ấy tan làm rồi."}},
      {hz:"忙",py:"máng",hv:"mang",pos:"tính từ 形",vi:"bận, bận rộn",emo:"😵‍💫",ex:{zh:"我很忙。",py:"Wǒ hěn máng.",vi:"Mình rất bận."}},
      {hz:"累",py:"lèi",hv:"luy",pos:"tính từ 形",vi:"mệt, mệt mỏi",emo:"😮‍💨",ex:{zh:"工作很累。",py:"Gōngzuò hěn lèi.",vi:"Công việc rất mệt."}},
      {hz:"每天",py:"měitiān",hv:"mỗi thiên",pos:"danh từ 名",vi:"mỗi ngày, hằng ngày",emo:"📅",ex:{zh:"我每天工作。",py:"Wǒ měitiān gōngzuò.",vi:"Ngày nào mình cũng làm việc."}},
      {hz:"都",py:"dōu",hv:"đô",pos:"phó từ 副",vi:"đều, tất cả đều",emo:"👥",ex:{zh:"我们都很忙。",py:"Wǒmen dōu hěn máng.",vi:"Chúng mình đều rất bận."}},
      {hz:"呢",py:"ne",hv:"ni",pos:"trợ từ 助",vi:"còn… thì sao? (hỏi lại)",emo:"🤔",ex:{zh:"我是老师，你呢？",py:"Wǒ shì lǎoshī, nǐ ne?",vi:"Mình là giáo viên, còn bạn?"}},
      {hz:"家",py:"jiā",hv:"gia",pos:"lượng từ 量",vi:"(lượng từ cho công ty, cửa hàng)",emo:"🏬",ex:{zh:"一家公司",py:"yì jiā gōngsī",vi:"một công ty"}}
    ],
    extra:[
      {flag:"👨‍🍳",hz:"厨师",py:"chúshī",hv:"trù sư",vi:"đầu bếp"},
      {flag:"🧑‍🌾",hz:"农民",py:"nóngmín",hv:"nông dân",vi:"nông dân"},
      {flag:"🎭",hz:"演员",py:"yǎnyuán",hv:"diễn viên",vi:"diễn viên"},
      {flag:"🎙️",hz:"歌手",py:"gēshǒu",hv:"ca thủ",vi:"ca sĩ"},
      {flag:"🗣️",hz:"翻译",py:"fānyì",hv:"phiên dịch",vi:"phiên dịch viên"},
      {flag:"💻",hz:"程序员",py:"chéngxùyuán",hv:"trình tự viên",vi:"lập trình viên"},
      {flag:"🤵",hz:"老板",py:"lǎobǎn",hv:"lão bản",vi:"ông chủ, sếp"},
      {flag:"🛒",hz:"售货员",py:"shòuhuòyuán",hv:"thụ hóa viên",vi:"nhân viên bán hàng"}
    ],
    match:[
      {zh:"老师",vi:"giáo viên"},{zh:"医生",vi:"bác sĩ"},{zh:"护士",vi:"y tá"},{zh:"律师",vi:"luật sư"},
      {zh:"记者",vi:"phóng viên"},{zh:"司机",vi:"tài xế"},{zh:"工程师",vi:"kỹ sư"},{zh:"警察",vi:"cảnh sát"}
    ],
    sentences:[
      {words:["你","做","什么","工作","？"],zh:"你做什么工作？",py:"Nǐ zuò shénme gōngzuò?",vi:"Bạn làm nghề gì?"},
      {words:["我","是","老师","。"],zh:"我是老师。",py:"Wǒ shì lǎoshī.",vi:"Mình là giáo viên."},
      {words:["你","在","哪儿","工作","？"],zh:"你在哪儿工作？",py:"Nǐ zài nǎr gōngzuò?",vi:"Bạn làm việc ở đâu?"},
      {words:["我","在","医院","工作","。"],zh:"我在医院工作。",py:"Wǒ zài yīyuàn gōngzuò.",vi:"Mình làm việc ở bệnh viện."},
      {words:["他","不是","律师","，","他","是","记者","。"],zh:"他不是律师，他是记者。",py:"Tā bú shì lǜshī, tā shì jìzhě.",vi:"Anh ấy không phải luật sư, anh ấy là phóng viên."}
    ],
    grammar:[
      { t:"Hỏi nghề nghiệp với 做什么工作", say:"你做什么工作？我是老师。",
        p:'Muốn hỏi "làm nghề GÌ", tiếng Trung đặt <b class="zh">什么</b> ngay trước <b class="zh">工作</b> — KHÔNG đảo trật tự từ như tiếng Anh. Khi trả lời, dùng câu <b class="zh">是</b>: <b class="zh">我是</b> + tên nghề. Cách hỏi trang trọng hơn: <b class="zh">你的职业是什么？</b>',
        formula:'Chủ ngữ + 做 + <em>什么</em> + 工作？',
        ex:[
          {zh:"你做什么工作？— 我是老师。",py:"Nǐ zuò shénme gōngzuò? — Wǒ shì lǎoshī.",vi:"Bạn làm nghề gì? — Mình là giáo viên."},
          {zh:"你爸爸做什么工作？— 他是医生。",py:"Nǐ bàba zuò shénme gōngzuò? — Tā shì yīshēng.",vi:"Bố bạn làm nghề gì? — Bố mình là bác sĩ."},
          {zh:"你的职业是什么？— 我是记者。",py:"Nǐ de zhíyè shì shénme? — Wǒ shì jìzhě.",vi:"Nghề nghiệp của bạn là gì? — Mình là phóng viên."}
        ]},
      { t:"Câu chữ 是 — giới thiệu nghề · phủ định 不是", say:"我是老师。我不是医生。",
        p:'Nói mình làm nghề gì thì dùng <b class="zh">是</b> (là): <b class="zh">我是工程师。</b> Phủ định thêm <b class="zh">不</b> trước <b class="zh">是</b> → <b class="zh">不是</b>, đọc là <b>bú shì</b>. Câu hỏi chỉ cần thêm <b class="zh">吗</b> vào cuối câu — trật tự từ giữ nguyên.',
        formula:'Chủ ngữ +（不）<em>是</em> + nghề nghiệp（+ 吗？）',
        cells:[
          {t:"✅ Khẳng định", body:'<span class="zh">我是老师。</span> Wǒ shì lǎoshī.<br><span class="zh">他是工程师。</span> Tā shì gōngchéngshī.'},
          {t:"❌ Phủ định · ❓ Nghi vấn", body:'<span class="zh">我不是医生。</span> Wǒ bú shì yīshēng.<br><span class="zh">你是律师吗？</span> Nǐ shì lǜshī ma?'}
        ],
        ex:[]},
      { t:"在 + địa điểm + 工作 — làm việc ở đâu", say:"你在哪儿工作？我在医院工作。",
        p:'Đây là điểm dễ sai nhất với người Việt: cụm <b class="zh">在 + địa điểm</b> phải đứng <b>TRƯỚC</b> động từ <b class="zh">工作 / 上班</b>, ngược hẳn tiếng Việt ("làm việc <u>ở bệnh viện</u>"). Nói <span class="zh">我工作在医院</span> là SAI.',
        formula:'Chủ ngữ + <em>在</em> + địa điểm + 工作 / 上班',
        ex:[
          {zh:"你在哪儿工作？— 我在医院工作。",py:"Nǐ zài nǎr gōngzuò? — Wǒ zài yīyuàn gōngzuò.",vi:"Bạn làm việc ở đâu? — Mình làm ở bệnh viện."},
          {zh:"她在学校工作，是老师。",py:"Tā zài xuéxiào gōngzuò, shì lǎoshī.",vi:"Cô ấy làm ở trường, là giáo viên."},
          {zh:"我在一家公司上班。",py:"Wǒ zài yì jiā gōngsī shàngbān.",vi:"Mình đi làm ở một công ty."}
        ]},
      { t:'Biến điệu của 不 — "不"的变调', say:"不是。不忙。不累。",
        p:'<b class="zh">不</b> vốn đọc thanh 4 (<b>bù</b>). Nhưng khi đứng trước một chữ <b>cũng mang thanh 4</b>, nó đổi thành thanh 2 (<b>bú</b>). Đây là quy tắc bắt buộc khi nói.',
        formula:'不 + thanh 1/2/3 → <em>bù</em>　·　不 + thanh 4 → <em>bú</em>',
        cells:[
          {t:"bù — trước thanh 1, 2, 3", body:'<span class="zh">不忙</span> bù máng · <span class="zh">不好</span> bù hǎo · <span class="zh">不来</span> bù lái'},
          {t:"bú — trước thanh 4", body:'<span class="zh">不是</span> bú shì · <span class="zh">不累</span> bú lèi · <span class="zh">不在</span> bú zài'}
        ],
        quiz:"A", ex:[]}
    ],
    quizA:[
      {q:"<em>不</em> + 是",sub:"shì — thanh 4",opts:["bù ˋ","bú ˊ"],ans:1,say:"不是",note:"bú shì 不是 — trước thanh 4 đọc bú"},
      {q:"<em>不</em> + 忙",sub:"máng — thanh 2",opts:["bù ˋ","bú ˊ"],ans:0,say:"不忙",note:"bù máng 不忙"},
      {q:"<em>不</em> + 累",sub:"lèi — thanh 4",opts:["bù ˋ","bú ˊ"],ans:1,say:"不累",note:"bú lèi 不累"},
      {q:"<em>不</em> + 好",sub:"hǎo — thanh 3",opts:["bù ˋ","bú ˊ"],ans:0,say:"不好",note:"bù hǎo 不好"},
      {q:"<em>不</em> + 工作",sub:"gōng — thanh 1",opts:["bù ˋ","bú ˊ"],ans:0,say:"不工作",note:"bù gōngzuò 不工作"},
      {q:"<em>不</em> + 去",sub:"qù — thanh 4",opts:["bù ˋ","bú ˊ"],ans:1,say:"不去",note:"bú qù 不去"},
      {q:"<em>不</em> + 来",sub:"lái — thanh 2",opts:["bù ˋ","bú ˊ"],ans:0,say:"不来",note:"bù lái 不来"},
      {q:"<em>不</em> + 在",sub:"zài — thanh 4",opts:["bù ˋ","bú ˊ"],ans:1,say:"不在",note:"bú zài 不在"}
    ],
    dialogues:[
      { title:"Hai người bạn hỏi nhau về công việc", lines:[
        {sp:"A",zh:"你好！你做什么工作？",py:"Nǐ hǎo! Nǐ zuò shénme gōngzuò?",vi:"Chào bạn! Bạn làm nghề gì?"},
        {sp:"B",zh:"我是老师，在学校工作。你呢？",py:"Wǒ shì lǎoshī, zài xuéxiào gōngzuò. Nǐ ne?",vi:"Mình là giáo viên, làm ở trường học. Còn bạn?"},
        {sp:"A",zh:"我是记者。",py:"Wǒ shì jìzhě.",vi:"Mình là phóng viên."},
        {sp:"B",zh:"你的工作忙吗？",py:"Nǐ de gōngzuò máng ma?",vi:"Công việc của bạn có bận không?"},
        {sp:"A",zh:"很忙，也很累。你呢？",py:"Hěn máng, yě hěn lèi. Nǐ ne?",vi:"Rất bận, cũng rất mệt. Còn bạn?"},
        {sp:"B",zh:"我不太忙。",py:"Wǒ bú tài máng.",vi:"Mình không bận lắm."}
      ]},
      { title:"Hỏi về nơi làm việc và nghề của bố mẹ", lines:[
        {sp:"A",zh:"你在哪儿工作？",py:"Nǐ zài nǎr gōngzuò?",vi:"Bạn làm việc ở đâu?"},
        {sp:"B",zh:"我在一家公司工作，我是经理。",py:"Wǒ zài yì jiā gōngsī gōngzuò, wǒ shì jīnglǐ.",vi:"Mình làm ở một công ty, mình là giám đốc."},
        {sp:"A",zh:"你爸爸妈妈做什么工作？",py:"Nǐ bàba māma zuò shénme gōngzuò?",vi:"Bố mẹ bạn làm nghề gì?"},
        {sp:"B",zh:"我爸爸是医生，在医院工作。",py:"Wǒ bàba shì yīshēng, zài yīyuàn gōngzuò.",vi:"Bố mình là bác sĩ, làm ở bệnh viện."},
        {sp:"A",zh:"你妈妈也是医生吗？",py:"Nǐ māma yě shì yīshēng ma?",vi:"Mẹ bạn cũng là bác sĩ à?"},
        {sp:"B",zh:"不是，她是护士。",py:"Bú shì, tā shì hùshi.",vi:"Không, mẹ mình là y tá."},
        {sp:"A",zh:"他们每天都很忙吧？",py:"Tāmen měitiān dōu hěn máng ba?",vi:"Ngày nào hai bác cũng rất bận nhỉ?"},
        {sp:"B",zh:"是，他们很忙，也很累。",py:"Shì, tāmen hěn máng, yě hěn lèi.",vi:"Đúng vậy, bố mẹ mình rất bận, cũng rất mệt."}
      ]}
    ]
  },
  { id:"l4", courseId:"c1", no:4, zh:"现在几点", py:"Xiànzài jǐ diǎn", vi:"Bây giờ là mấy giờ?", hv:"hiện tại kỷ điểm", emo:"🕐",
    vocab:[], extra:[], match:[], sentences:[], grammar:[], dialogues:[] },
  { id:"l5", courseId:"c1", no:5, zh:"你家有几口人", py:"Nǐ jiā yǒu jǐ kǒu rén", vi:"Nhà bạn có mấy người?", hv:"nhĩ gia hữu kỷ khẩu nhân", emo:"👨‍👩‍👧",
    vocab:[], extra:[], match:[], sentences:[], grammar:[], dialogues:[] },
  { id:"l6", courseId:"c1", no:6, zh:"多少钱", py:"Duōshao qián", vi:"Bao nhiêu tiền?", hv:"đa thiểu tiền", emo:"💰",
    vocab:[], extra:[], match:[], sentences:[], grammar:[], dialogues:[] }
];

/* ---------------------------------------------------------------- LỚP HỌC */
SEED.classes = [
  { id:"k1", code:"HSK1-A01", name:"HSK 1 — Ca tối A01", courseId:"c1", teacherId:"u2",
    schedule:"Tối 2 · 4 · 6 — 19h30", room:"204 · Cơ sở Cầu Giấy", start:"12/07/2026", end:"20/11/2026",
    status:"run", week:6, weeks:16,
    students:["u3","u5","u6","u7","u8","u9","u10","u11"] },
  { id:"k2", code:"HSK1-B02", name:"HSK 1 — Cuối tuần B02", courseId:"c1", teacherId:"u2",
    schedule:"Sáng 7 · CN — 9h00", room:"108 · Cơ sở Cầu Giấy", start:"05/07/2026", end:"15/12/2026",
    status:"run", week:5, weeks:20, students:["u12","u13","u14"] },
  { id:"k3", code:"HSK2-C01", name:"HSK 2 — Ca tối C01", courseId:"c2", teacherId:"u4",
    schedule:"Tối 3 · 5 — 19h30", room:"301", start:"01/06/2026", end:"30/10/2026",
    status:"run", week:12, weeks:16, students:["u5","u7"] },
  { id:"k4", code:"HSK3-D01", name:"HSK 3 — Luyện thi D01", courseId:"c4", teacherId:"u4",
    schedule:"Tối 3 · 5 · 7 — 18h00", room:"302", start:"01/09/2026", end:"20/12/2026",
    status:"soon", week:0, weeks:14, students:["u11","u13"] },
  { id:"k5", code:"HSK1-A00", name:"HSK 1 — Ca tối A00", courseId:"c1", teacherId:"u2",
    schedule:"Tối 2 · 4 · 6 — 19h30", room:"204", start:"10/01/2026", end:"20/05/2026",
    status:"done", week:16, weeks:16, students:["u12","u14"] }
];

/* ---------------------------------------------------------------- BÀI TẬP */
SEED.assignments = [
  { id:"a1", classId:"k1", courseId:"c1", lessonId:"l3",
    title:"Bài tập Bài 3 — 你做什么工作", kind:"Bài tập về nhà",
    note:"Các em xem lại phần Ngữ pháp mục 3 và 4 trước khi làm. Câu 8 nhớ ghi âm ở nơi yên tĩnh nhé.",
    due:"05/09/2026 23:59", minutes:20, tries:1, maxScore:10,
    allowLate:true, showAnswer:true, shuffle:false, status:"open", assignedAt:"01/09/2026 18:02",
    questions:[
      {id:"q1", type:"mcq", score:1, q:'A: <span class="zh">你做什么工作？</span>　B: ______。',
       opts:['你做什么工作','你在哪儿工作','你叫什么名字'], ans:0, tag:"Từ vựng nghề nghiệp"},
      {id:"q2", type:"mcq", score:1, q:'Chọn từ đúng: Mẹ mình là y tá — <span class="zh">我妈妈是 ______。</span>',
       opts:['医生','护士','老师'], ans:1, tag:"Từ vựng nghề nghiệp"},
      {id:"q3", type:"mcq", score:1, q:'<span class="zh">他是公司经理。</span> — Câu này nghĩa là gì?',
       opts:['Anh ấy là giám đốc công ty','Anh ấy làm ở ngân hàng','Anh ấy là kỹ sư'], ans:0, tag:"Từ vựng nghề nghiệp"},
      {id:"q4", type:"mcq", score:1, q:'A: <span class="zh">你妈妈也是老师吗？</span>　B: 不是，______。',
       opts:['她是护士','她也是老师','我是记者'], ans:0, tag:"Ngữ pháp 是"},
      {id:"q5", type:"mcq", score:1, q:'A: <span class="zh">你在哪儿工作？</span>　B: ______。',
       opts:['我很累','我在医院工作','他是经理','我是老师'], ans:1, tag:"Ngữ pháp 在…工作"},
      {id:"q6", type:"fill", score:1, q:'Điền phiên âm đúng của <span class="zh">不</span>:',
       stem:'她 ___ 是 医生，她 是 护士。', opts:['bù','bú'], ans:1, tag:"Biến điệu của 不"},
      {id:"q7", type:"order", score:1, q:'Sắp xếp thành câu: "Bố mình là bác sĩ, làm ở bệnh viện."',
       words:['我爸爸','是','医生','，','在','医院','工作','。'],
       ans:'我爸爸是医生，在医院工作。', tag:"Ngữ pháp 在…工作"},
      {id:"q8", type:"audio", score:2, q:'Đọc to và ghi âm: <span class="zh">我是记者，在报社工作。我很忙，也很累。</span>',
       say:"我是记者，在报社工作。我很忙，也很累。", tag:"Phát âm thanh điệu"},
      {id:"q9", type:"order", score:1, q:'Sắp xếp thành câu: "Cô ấy làm ở trường học, là giáo viên."',
       words:['她','在','学校','工作','，','是','老师','。'],
       ans:'她在学校工作，是老师。', tag:"Ngữ pháp 在…工作"},
      {id:"q10", type:"write", score:2, q:'Viết 3–5 câu giới thiệu nghề nghiệp của bố mẹ em.',
       tag:"Trật tự từ"}
    ]},
  { id:"a2", classId:"k1", courseId:"c1", lessonId:"l3",
    title:"Luyện viết chữ Hán — Tuần 6", kind:"Bài tập về nhà",
    note:"Viết mỗi chữ 5 dòng, chụp ảnh vở rồi nộp lên.",
    due:"09/09/2026 23:59", minutes:0, tries:1, maxScore:10,
    allowLate:true, showAnswer:false, shuffle:false, status:"open", assignedAt:"01/09/2026 18:05",
    questions:[
      {id:"q1", type:"photo", score:10, q:'Chụp ảnh trang vở viết 10 chữ: <span class="zh">工作 职业 老师 医生 护士 记者 律师 经理 医院 银行</span>', tag:"Chữ viết tay"}
    ]},
  { id:"a3", classId:"k1", courseId:"c1", lessonId:"l2",
    title:"Bài tập Bài 2 — 你是哪国人", kind:"Bài tập về nhà",
    note:"", due:"29/08/2026 23:59", minutes:15, tries:1, maxScore:10,
    allowLate:false, showAnswer:true, shuffle:false, status:"closed", assignedAt:"25/08/2026 18:00",
    questions:[
      {id:"q1", type:"mcq", score:5, q:'<span class="zh">你是哪国人？</span> nghĩa là gì?',
       opts:['Bạn là người nước nào?','Bạn tên là gì?','Bạn làm nghề gì?'], ans:0, tag:"Từ vựng nghề nghiệp"},
      {id:"q2", type:"mcq", score:5, q:'Người Việt Nam — <span class="zh">______人</span>',
       opts:['越南','中国','美国'], ans:0, tag:"Từ vựng nghề nghiệp"}
    ]}
];

/* ---------------------------------------------------------------- BÀI NỘP
   status: none (chưa nộp) | draft | submitted | late | graded
   -------------------------------------------------------------------------- */
SEED.submissions = [
  { id:"s1", assignmentId:"a1", studentId:"u3", status:"submitted", at:"01/09/2026 20:14",
    answers:{q1:0,q2:1,q3:0,q4:0,q5:1,q6:0,q7:'我爸爸是医生，在医院工作。',q8:"__audio__",q9:'她工作在学校，是老师。',q10:'我爸爸是医生，在医院工作。我妈妈是老师，她在学校工作。他们每天都很忙，也很累。'},
    manual:{}, comments:{}, autoScore:5, finalScore:null },
  { id:"s2", assignmentId:"a1", studentId:"u5", status:"graded", at:"31/08/2026 21:02",
    answers:{q1:0,q2:1,q3:0,q4:0,q5:1,q6:1,q7:'我爸爸是医生，在医院工作。',q8:"__audio__",q9:'她在学校工作，是老师。',q10:'我爸爸是工程师。'},
    manual:{q8:2,q10:1.5}, comments:{}, autoScore:7, finalScore:9.5 },
  { id:"s3", assignmentId:"a1", studentId:"u6", status:"submitted", at:"01/09/2026 09:33",
    answers:{q1:0,q2:1,q3:1,q4:0,q5:1,q6:1,q7:'我爸爸是医生，在医院工作。',q8:"__audio__",q9:'她在学校工作，是老师。',q10:'我妈妈是护士。'},
    manual:{}, comments:{}, autoScore:6, finalScore:null },
  { id:"s4", assignmentId:"a1", studentId:"u7", status:"graded", at:"31/08/2026 19:47",
    answers:{q1:0,q2:1,q3:0,q4:0,q5:1,q6:1,q7:'我爸爸是医生，在医院工作。',q8:"__audio__",q9:'她在学校工作，是老师。',q10:'我爸爸是老师，我妈妈是医生。'},
    manual:{q8:1.5,q10:2}, comments:{}, autoScore:7, finalScore:8.5 },
  { id:"s5", assignmentId:"a1", studentId:"u8", status:"late", at:"06/09/2026 07:10",
    answers:{q1:0,q2:0,q3:0,q4:1,q5:1,q6:0,q7:'我爸爸医生是，在医院工作。',q8:"__audio__",q9:'她工作在学校，是老师。',q10:'我爸爸是司机。'},
    manual:{}, comments:{}, autoScore:3, finalScore:null },
  { id:"s6", assignmentId:"a1", studentId:"u9", status:"submitted", at:"01/09/2026 22:55",
    answers:{q1:0,q2:1,q3:0,q4:0,q5:0,q6:1,q7:'我爸爸是医生，在医院工作。',q8:"__audio__",q9:'她在学校工作，是老师。',q10:'我妈妈是老师。'},
    manual:{}, comments:{}, autoScore:6, finalScore:null },
  { id:"s7", assignmentId:"a3", studentId:"u3", status:"graded", at:"28/08/2026 20:10",
    answers:{q1:0,q2:0}, manual:{}, comments:{}, autoScore:10, finalScore:8.5 }
];

/* ---------------------------------------------------------------- GHI CHÚ RIÊNG */
SEED.feedbacks = [
  { id:"f1", assignmentId:"a1", studentId:"u5", teacherId:"u2", sentAt:"02/09/2026 08:05",
    weak:[], body:"Hà làm bài rất tốt, 9/10 câu đúng. Phần ghi âm phát âm chuẩn, chỉ cần chú ý ngắt câu tự nhiên hơn.",
    todos:["Luyện đọc to hội thoại 2 mỗi ngày 5 phút"], allowReply:true },
  { id:"f2", assignmentId:"a1", studentId:"u7", teacherId:"u2", sentAt:"02/09/2026 08:12",
    weak:["Phát âm thanh điệu"], body:"Ngọc nắm chắc ngữ pháp, nhưng thanh điệu ở câu ghi âm còn chưa rõ.",
    todos:["Nghe lại phần Từ mới, đọc theo 2 lần"], allowReply:true },
  { id:"f3", assignmentId:"a3", studentId:"u3", teacherId:"u2", sentAt:"29/08/2026 09:00",
    weak:["Từ vựng nghề nghiệp"], body:"Bài 2 em làm tốt. Nhớ ôn lại tên các nước trước khi vào Bài 3.",
    todos:["Ôn 10 tên nước hay gặp"], allowReply:true }
];

/* ---------------------------------------------------------------- KHÁC */
SEED.weakTags = ["Từ vựng nghề nghiệp","Ngữ pháp 是","Ngữ pháp 在…工作","Biến điệu của 不",
                 "Hội thoại","Phát âm thanh điệu","Trật tự từ","Chữ viết tay"];

/* Khởi động có kho thẻ riêng, không dùng chung với Từ mới.
   Dữ liệu mẫu chép sang cho khỏi phải gõ lại; từ đây hai bên độc lập —
   sửa bên nào chỉ đổi bên đó. */
SEED.lessons.forEach(function (l) {
  l.warmup = JSON.parse(JSON.stringify(l.vocab));
});

SEED.emojiPool = ["📗","📘","📙","📕","📓","🀄","🏮","🐉","🧧","🎋","✏️","🎓"];
SEED.colorPool = ["#D6453D","#E9A23B","#2F9E77","#3B6FD4","#8B5CF6"];

SEED.activity = [
  {ic:"🟢", who:"Trần Thị Lan", what:"đã gửi ghi chú cho <b>Phạm Thu Hà</b> — Bài tập Bài 3", when:"Hôm nay, 08:05"},
  {ic:"🔵", who:"Trần Thị Lan", what:"đã giao <b>Bài tập Bài 3</b> cho lớp HSK1-A01", when:"01/09, 18:02"},
  {ic:"🟣", who:"Phạm Quốc Đạt", what:"đã thêm 2 học viên vào lớp <b>HSK3-D01</b>", when:"31/08, 15:40"},
  {ic:"🟠", who:"Phạm Quốc Đạt", what:"đã xuất bản <b>Bài 8 · 商务汉语</b>", when:"27/08, 21:15"},
  {ic:"🟢", who:"Phạm Thu Hà", what:"đã nộp <b>Bài tập Bài 3</b>", when:"31/08, 21:02"}
];
