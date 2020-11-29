let color_list;

function sort_color_list(key){

  color_list.sort(function(a,b){
    if( a[key] < b[key] ) return -1;
    if( a[key] > b[key] ) return 1;
    //keyが同じ値だったら、次に色相で並べ替え
    if (a['hue'] < b['hue']) return -1;
    if (a['hue'] > b['hue']) return 1;
    return 0;
  });
  
}

let office_colors = [
  {
    label: '濃色',
    color: '#1F437D',
    idol: '',
    sys: 'dk2',
  },
  {
    label: '淡色',
    color: '#EFEDE1',
    idol: '',
    sys: 'lt2',
  },
  {
    label: 'アクセント1',
    color: '#5182BA',
    idol: '',
    sys: 'accent1',
  },
  {
    label: 'アクセント2',
    color: '#C0504C',
    idol: '',
    sys: 'accent2',
  },
  {
    label: 'アクセント3',
    color: '#99BD5B',
    idol: '',
    sys: 'accent3',
  },
  {
    label: 'アクセント4',
    color: '#8165A2',
    idol: '',
    sys: 'accent4',
  },
  {
    label: 'アクセント5',
    color: '#52ADCC',
    idol: '',
    sys: 'accent5',
  },
  {
    label: 'アクセント6',
    color: '#F79647',
    idol: '',
    sys: 'accent6',
  }
];

function btn_color_selected(id, color, label){
  document.getElementById('color_selection').innerHTML = '';

  for (let office_color of office_colors){
    if (office_color.label == id){
      office_color.color= color;
      office_color.idol = label;
      break;
    }
  }

  show_selected_colors();

}

function save_xml(){
  
  let content = `
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:clrScheme
    xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Slidehelper - 001">
    <a:dk1>
        <a:sysClr val="windowText" lastClr="000000"/>
    </a:dk1>
    <a:lt1>
        <a:sysClr val="window" lastClr="FFFFFF"/>
    </a:lt1>
  `;
  for (let color of office_colors){
    content += `
    <a:${color.sys}>
      <a:sysClr val="window" lastClr="${color.color.slice(1)}"/>
    </a:${color.sys}>
    `;
  }
  content += `
<a:hlink>
  <a:srgbClr val="58a6dc"/>
</a:hlink>
<a:folHlink>
  <a:srgbClr val="5abfb7"/>
</a:folHlink>
</a:clrScheme>
`;


  const a = document.createElement('a');
a.href = URL.createObjectURL(new Blob([content], {type: 'text/plain'}));
a.download = 'colors.xml';
// %HOMEPATH%/AppData/Roaming/Microsoft/Templates/Document Themes/Theme Colors/

a.style.display = 'none';
document.body.appendChild(a);
a.click();
document.body.removeChild(a);



}

function accent_color(color){
  //if (color.s > 0.98 || color.s < 0.2 || color.v > 0.95 || color.v < 0.3) return false;
  return true;
}

function dark_color(color){
  if (color.v > 0.5) return false;
  return true;
}

function light_color(color){
  if (color.v < 0.9 || color.s > 0.25) return false;
  return true;
}

function open_colors(id){
  
  const title = $('input[name=titles]:checked').val();

  
  let func = accent_color;
  if (id == '濃色') func = dark_color;
  if (id == '淡色') func = light_color;
  const filtered_colors = color_list.filter(func).filter(color => color.title == title);

  let color_selection_html = '';
  for (let color of filtered_colors){
    let menu;
    menu = 
    `<button
      class="btn"
      style="
        text-align: center;
        float: left;
        width: 150;
        cursor   : pointer; 
        background-color: ${color.color};
        color: ${color.font_color};
        " 
      onclick="btn_color_selected('${id}', '${color.color}', '${color.label}')"
      >
      ${color.label}
    </button>`;
    color_selection_html += menu;

  }
  document.getElementById('color_selection').innerHTML = color_selection_html;
}

function btn_clicked(id){

  open_colors(id);
}

function show_selected_colors(){
  let selected_colors = '';
  selected_colors += '<table>';
  for (let color of office_colors){
    selected_colors += `
      <tr>
        <td>${color.label}</td>
        <td><button class="btn" style="background-color:${color.color}; width: 50;" onclick="btn_clicked('${color.label}')">　</button></td>
        <td>${color.idol}</td>
      </tr>
    `;
  }
  selected_colors += '</table>';

  document.getElementById('selected_colors').innerHTML = selected_colors;
}

function init_filter(){
  let title_filter = '';
  title_filter += '<div class="btn-group btn-group-toggle" data-toggle="buttons">';
  const titles = [
    ['MillionStars', 'ミリオンライブ'],
    ['CinderellaGirls', 'シンデレラガールズ'],
    ['315ProIdols', 'Side M'],
    ['765AS', '765AS'],
    ['283Pro', 'シャイニーカラーズ']
  ];

  for (let i = 0; i < titles.length; i++){
    const title = titles[i];
    const active = (i == 0) ? 'active' : '';
    const checked = (i == 0) ? 'checked' : '';
    title_filter += `
    <label class="btn btn-secondary ${active}">
      <input type="radio" name="titles" value="${title[0]}" autocomplete="off" ${checked}> ${title[1]}
    </label>`;
  }

  document.getElementById('filters').innerHTML = title_filter;
}

function init(){
  show_selected_colors();
  init_filter();
  color_list  = [];

  for (let idol of idols){

    const color = idol[2];
    const label = idol[0];
    const title = idol[1];

    //765ASと1st visionが被るのでスキップ
    if (title == '1st Vision'){
      continue;
    }

    const brightness = chroma(color).get('hsv.v');
    const saturation = chroma(color).get('hsv.s');
    let hue = chroma(color).get('hsv.h');
    if (isNaN(hue)) hue = 0; //
    const font_color = chroma.contrast(color, 'white') > chroma.contrast(color, 'black') ? 'white' : 'black';

    color_list.push({
      color: color,
      label: label,
      title: title,
      hue: hue,
      s: saturation,
      v: brightness,

      font_color: font_color,
    });
  }

  sort_color_list('label');

  
}


 //-------------------------------------------------------------------------------------------------------------


const idols = 
[['佐久間まゆ', 'CinderellaGirls', '#D1197B'],
 ['村上巴', 'CinderellaGirls', '#D42E38'],
 ['島原エレナ', 'MillionStars', '#9BCE92'],
 ['向井拓海', 'CinderellaGirls', '#A90582'],
 ['七尾百合子', 'MillionStars', '#C7B83C'],
 ['速水奏', 'CinderellaGirls', '#0D386D'],
 ['依田芳乃', 'CinderellaGirls', '#C7BAB4'],
 ['天海春香', '1st Vision', '#E22B30'],
 ['姫川友紀', 'CinderellaGirls', '#E9870C'],
 ['桜庭薫', '315ProIdols', '#1945BA'],
 ['百瀬莉緒', 'MillionStars', '#F19591'],
 ['ピエール', '315ProIdols', '#8BDC63'],
 ['水本ゆかり', 'CinderellaGirls', '#E8BAD6'],
 ['四条貴音', '1st Vision', '#A6126A'],
 ['葛之葉雨彦', '315ProIdols', '#111721'],
 ['神崎蘭子', 'CinderellaGirls', '#7E3188'],
 ['若里春名', '315ProIdols', '#71D448'],
 ['水瀬伊織', '765AS', '#FD99E1'],
 ['松永涼', 'CinderellaGirls', '#202449'],
 ['鷹富士茄子', 'CinderellaGirls', '#5C068F'],
 ['喜多見柚', 'CinderellaGirls', '#EADC62'],
 ['宮尾美也', 'MillionStars', '#D7A96B'],
 ['周防桃子', 'MillionStars', '#EFB864'],
 ['月岡恋鐘', '283Pro', '#F94CAD'],
 ['龍崎薫', 'CinderellaGirls', '#F4D956'],
 ['箱崎星梨花', 'MillionStars', '#ED90BA'],
 ['硲道夫', '315ProIdols', '#436CA9'],
 ['南条光', 'CinderellaGirls', '#ED0829'],
 ['双海亜美', '765AS', '#FFE43F'],
 ['高坂海美', 'MillionStars', '#E9739B'],
 ['市川雛菜', '283Pro', '#FFC639'],
 ['大和亜季', 'CinderellaGirls', '#276E4E'],
 ['園田智代子', '283Pro', '#F93B90'],
 ['島村卯月', 'CinderellaGirls', '#EC7092'],
 ['天空橋朋花', 'MillionStars', '#BEE3E3'],
 ['伊集院北斗', '315ProIdols', '#1C23AA'],
 ['難波笑美', 'CinderellaGirls', '#E9463D'],
 ['堀裕子', 'CinderellaGirls', '#E89B55'],
 ['福丸小糸', '283Pro', '#7967C3'],
 ['樋口円香', '283Pro', '#BE1E3E'],
 ['鷹城恭二', '315ProIdols', '#6AC4E9'],
 ['徳川まつり', 'MillionStars', '#5ABFB7'],
 ['三船美優', 'CinderellaGirls', '#01AAA5'],
 ['緒方智絵里', 'CinderellaGirls', '#69B64C'],
 ['市原仁奈', 'CinderellaGirls', '#F7DE8C'],
 ['菊地真', '1st Vision', '#515558'],
 ['椎名法子', 'CinderellaGirls', '#EA495B'],
 ['大槻唯', 'CinderellaGirls', '#EFB817'],
 ['白坂小梅', 'CinderellaGirls', '#AAC5E2'],
 ['舞田類', '315ProIdols', '#F5D24B'],
 ['九十九一希', '315ProIdols', '#CF9E51'],
 ['望月杏奈', 'MillionStars', '#7E6CA8'],
 ['日野茜', 'CinderellaGirls', '#EA4F21'],
 ['双葉杏', 'CinderellaGirls', '#F19DB4'],
 ['東雲荘一郎', '315ProIdols', '#02946C'],
 ['永吉昴', 'MillionStars', '#AEB49C'],
 ['如月千早', '765AS', '#2743D2'],
 ['三浦あずさ', '1st Vision', '#9238BE'],
 ['舞浜歩', 'MillionStars', '#E25A9B'],
 ['蒼井享介', '315ProIdols', '#23CD7A'],
 ['久川颯', 'CinderellaGirls', '#7ADAD6'],
 ['小早川紗枝', 'CinderellaGirls', '#D967A3'],
 ['田中摩美々', '283Pro', '#A846FB'],
 ['我那覇響', '1st Vision', '#01ADB9'],
 ['黒野玄武', '315ProIdols', '#0F0C9F'],
 ['城ヶ崎莉嘉', 'CinderellaGirls', '#F7D30D'],
 ['乙倉悠貴', 'CinderellaGirls', '#F2C0C1'],
 ['福田のり子', 'MillionStars', '#ECEB70'],
 ['横山奈緒', 'MillionStars', '#788BC5'],
 ['本田未央', 'CinderellaGirls', '#F6B128'],
 ['十時愛梨', 'CinderellaGirls', '#E9425C'],
 ['幽谷霧子', '283Pro', '#D9F2DD'],
 ['大河タケル', '315ProIdols', '#0E0C9F'],
 ['日高愛', 'DearlyStars', '#E85786'],
 ['秋月涼', '315ProIdols', '#70B449'],
 ['菊地真', '765AS', '#515558'],
 ['黛冬優子', '283Pro', '#5CE626'],
 ['蒼井悠介', '315ProIdols', '#FEE806'],
 ['四条貴音', '765AS', '#A6126A'],
 ['柏木翼', '315ProIdols', '#3BAF29'],
 ['一ノ瀬志希', 'CinderellaGirls', '#A01B50'],
 ['芹沢あさひ', '283Pro', '#F30100'],
 ['棟方愛海', 'CinderellaGirls', '#C82F7F'],
 ['桜守歌織', 'MillionStars', '#274079'],
 ['所恵美', 'MillionStars', '#454341'],
 ['最上静香', 'MillionStars', '#6495CF'],
 ['萩原雪歩', '1st Vision', '#D3DDE9'],
 ['双海真美', '1st Vision', '#FFE43F'],
 ['渡辺みのり', '315ProIdols', '#FA90A2'],
 ['兜大吾', '315ProIdols', '#E41C1A'],
 ['浜口あやめ', 'CinderellaGirls', '#471C87'],
 ['御手洗翔太', '315ProIdols', '#94D509'],
 ['冬美旬', '315ProIdols', '#1845B9'],
 ['木村龍', '315ProIdols', '#EE7220'],
 ['小日向美穂', 'CinderellaGirls', '#C64796'],
 ['上条春菜', 'CinderellaGirls', '#59B7DB'],
 ['ジュリア', 'MillionStars', '#D7385F'],
 ['相葉夕美', 'CinderellaGirls', '#EAE28D'],
 ['萩原雪歩', '765AS', '#D3DDE9'],
 ['及川雫', 'CinderellaGirls', '#FFFFFF'],
 ['道明寺歌鈴', 'CinderellaGirls', '#CC252D'],
 ['有栖川夏葉', '283Pro', '#90E667'],
 ['真壁瑞希', 'MillionStars', '#99B7DC'],
 ['高山紗代子', 'MillionStars', '#7F6575'],
 ['脇山珠美', 'CinderellaGirls', '#3A75BB'],
 ['松田亜利沙', 'MillionStars', '#B54461'],
 ['春日未来', 'MillionStars', '#EA5B76'],
 ['神谷幸広', '315ProIdols', '#F09079'],
 ['双海真美', '765AS', '#FFE43F'],
 ['城ヶ崎美嘉', 'CinderellaGirls', '#F4982B'],
 ['片桐早苗', 'CinderellaGirls', '#E94D1A'],
 ['関裕美', 'CinderellaGirls', '#F8C5C1'],
 ['高森藍子', 'CinderellaGirls', '#C5DD7F'],
 ['櫻木真乃', '283Pro', '#FFBAD6'],
 ['川島瑞樹', 'CinderellaGirls', '#3F59A6'],
 ['西城樹里', '283Pro', '#FFCB13'],
 ['浅倉透', '283Pro', '#50D0D0'],
 ['安部菜々', 'CinderellaGirls', '#E64A79'],
 ['小宮果穂', '283Pro', '#E75029'],
 ['古論クリス', '315ProIdols', '#1FC1DD'],
 ['前川みく', 'CinderellaGirls', '#CA113A'],
 ['野々原茜', 'MillionStars', '#EB613F'],
 ['櫻井桃華', 'CinderellaGirls', '#EF93BC'],
 ['森久保乃々', 'CinderellaGirls', '#97D3D3'],
 ['天道輝', '315ProIdols', '#E31C1A'],
 ['アナスタシア', 'CinderellaGirls', '#B0C5E4'],
 ['三峰結華', '283Pro', '#3B91C4'],
 ['大崎甘奈', '283Pro', '#F54275'],
 ['藤原肇', 'CinderellaGirls', '#7271B3'],
 ['猫柳キリオ', '315ProIdols', '#F7BD05'],
 ['白石紬', 'MillionStars', '#EBE1FF'],
 ['輿水幸子', 'CinderellaGirls', '#CCAACF'],
 ['三浦あずさ', '765AS', '#9238BE'],
 ['高槻やよい', '765AS', '#F39939'],
 ['上田鈴帆', 'CinderellaGirls', '#C9870F'],
 ['双海亜美', '1st Vision', '#FFE43F'],
 ['北村想楽', '315ProIdols', '#477525'],
 ['佐藤心', 'CinderellaGirls', '#E44E8E'],
 ['山下次郎', '315ProIdols', '#EE7602'],
 ['秋月涼', 'DearlyStars', '#B2D468'],
 ['アスラン=BBⅡ世', '315ProIdols', '#606CB2'],
 ['北条加蓮', 'CinderellaGirls', '#38BAB8'],
 ['伊吹翼', 'MillionStars', '#FED552'],
 ['水瀬伊織', '1st Vision', '#FD99E1'],
 ['佐竹美奈子', 'MillionStars', '#58A6DC'],
 ['白菊ほたる', 'CinderellaGirls', '#D162CB'],
 ['早坂美玲', 'CinderellaGirls', '#B72089'],
 ['エミリー', 'MillionStars', '#554171'],
 ['大崎甜花', '283Pro', '#E75BEC'],
 ['馬場このみ', 'MillionStars', '#F1BECB'],
 ['久川凪', 'CinderellaGirls', '#F7A1BA'],
 ['新田美波', 'CinderellaGirls', '#6DBCDB'],
 ['高槻やよい', '1st Vision', '#F39939'],
 ['木下ひなた', 'MillionStars', '#D1342C'],
 ['宮本フレデリカ', 'CinderellaGirls', '#9E1861'],
 ['藤本里奈', 'CinderellaGirls', '#653A2A'],
 ['八宮めぐる', '283Pro', '#FFE012'],
 ['佐々木千枝', 'CinderellaGirls', '#006AB6'],
 ['諸星きらり', 'CinderellaGirls', '#F8CA02'],
 ['五十嵐響子', 'CinderellaGirls', '#F567C6'],
 ['神谷奈緒', 'CinderellaGirls', '#8D75B3'],
 ['秋月律子', '765AS', '#01A860'],
 ['豊川風花', 'MillionStars', '#7278A8'],
 ['北上麗花', 'MillionStars', '#6BB6B0'],
 ['荒木比奈', 'CinderellaGirls', '#80C260'],
 ['大神環', 'MillionStars', '#EE762E'],
 ['結城晴', 'CinderellaGirls', '#45BDB4'],
 ['紅井朱雀', '315ProIdols', '#E63C2E'],
 ['和泉愛依', '283Pro', '#FF00FF'],
 ['握野英雄', '315ProIdols', '#57B3E5'],
 ['二宮飛鳥', 'CinderellaGirls', '#552A7C'],
 ['円城寺道流', '315ProIdols', '#CA9111'],
 ['田中琴葉', 'MillionStars', '#92CFBB'],
 ['岡村直央', '315ProIdols', '#1F1451'],
 ['神楽麗', '315ProIdols', '#3D5AC8'],
 ['水谷絵理', 'DearlyStars', '#00ADB9'],
 ['北沢志保', 'MillionStars', '#AFA690'],
 ['塩見周子', 'CinderellaGirls', '#DEE2EB'],
 ['姫野かのん', '315ProIdols', '#F7B5C4'],
 ['信玄誠司', '315ProIdols', '#78853A'],
 ['如月千早', '1st Vision', '#2743D2'],
 ['二階堂千鶴', 'MillionStars', '#F19557'],
 ['水嶋咲', '315ProIdols', '#FA7EB4'],
 ['多田李衣菜', 'CinderellaGirls', '#006DB2'],
 ['喜多日菜子', 'CinderellaGirls', '#F4D059'],
 ['我那覇響', '765AS', '#01ADB9'],
 ['木村夏樹', 'CinderellaGirls', '#55565A'],
 ['清澄九郎', '315ProIdols', '#79A5DF'],
 ['風野灯織', '283Pro', '#144384'],
 ['秋月律子', '1st Vision', '#01A860'],
 ['渋谷凛', 'CinderellaGirls', '#1C90CD'],
 ['華村翔真', '315ProIdols', '#7664A0'],
 ['篠宮可憐', 'MillionStars', '#B63B40'],
 ['星輝子', 'CinderellaGirls', '#A21D3C'],
 ['星井美希', '765AS', '#B4E04B'],
 ['高垣楓', 'CinderellaGirls', '#33D5AC'],
 ['秋山隼人', '315ProIdols', '#FE6B02'],
 ['卯月巻緒', '315ProIdols', '#F8C559'],
 ['牙崎漣', '315ProIdols', '#AC162A'],
 ['天ヶ瀬冬馬', '315ProIdols', '#F32333'],
 ['橘志狼', '315ProIdols', '#D13037'],
 ['天海春香', '765AS', '#E22B30'],
 ['杜野凛世', '283Pro', '#84C0EA'],
 ['都築圭', '315ProIdols', '#C5A6E2'],
 ['矢吹可奈', 'MillionStars', '#F5AD3B'],
 ['白瀬咲耶', '283Pro', '#006047'],
 ['赤城みりあ', 'CinderellaGirls', '#F8C715'],
 ['桑山千雪', '283Pro', '#FBFBFB'],
 ['三村かな子', 'CinderellaGirls', '#F4ABB4'],
 ['榊夏来', '315ProIdols', '#24CAD2'],
 ['星井美希', '1st Vision', '#B4E04B'],
 ['橘ありす', 'CinderellaGirls', '#5881C1'],
 ['中谷育', 'MillionStars', '#F7E78E'],
 ['伊瀬谷四季', '315ProIdols', '#F125C1'],
 ['中野有香', 'CinderellaGirls', '#CB78B0'],
 ['ロコ', 'MillionStars', '#FFF03C']];



