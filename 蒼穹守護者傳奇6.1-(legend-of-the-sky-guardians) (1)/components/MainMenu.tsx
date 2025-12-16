import React, { useState, useEffect } from 'react';
import { GameView } from '../types';
import { Sword, BookOpen, Scroll, ChevronLeft, ChevronRight, Lock, Unlock, Users, LogOut, X } from 'lucide-react';

interface MainMenuProps {
  onStart: () => void;
  onChangeView: (view: GameView) => void;
  onLoginAdmin: () => void;
  onLogoutAdmin: () => void;
  isAdminMode: boolean;
}

const LORE_CHAPTERS = [
    { title: "第一章：星核的悲鳴", content: "艾特拉大陸的夜空，曾是無數占星師讚頌的奇蹟。然而，就在那個沒有月亮的夜晚，一切都改變了。天空像一張脆弱的薄紙被無形的大手撕裂，露出了背後無盡的深淵。一顆燃燒著不祥紫炎的隕石，伴隨著刺耳的尖嘯聲，狠狠地撞擊在世界的中心。那一刻，大地的悲鳴響徹雲霄，星核的能量波動席捲了整個大陸。邊境的守望者們驚恐地發現，那些從裂縫中湧出的，不再是他們熟悉的野獸，而是扭曲、狂暴、且充滿毀滅慾望的虛空生物。它們沒有恐懼，沒有痛覺，只有對這個世界純粹的惡意。這不是一場普通的入侵，這是一場關乎存亡的浩劫的序曲。你，作為一名剛從學院畢業的年輕指揮官，被迫拿起了長劍，站在了這場風暴的最前線。" },
    { title: "第二章：絕望的烽火", content: "短短三個月，曾經繁榮的北方十二城邦已化為灰燼。烽火台上的狼煙在寒風中顯得如此無力，因為再也沒有援軍能夠趕來。難民們拖家帶口，在冰天雪地中艱難跋涉，他們的眼中失去了光彩，只剩下對未知的恐懼。你帶領著一支殘兵敗將，駐守在名為「最後防線」的峽谷要塞。這裡地勢險要，是通往南方腹地的唯一通道。你的士兵們疲憊不堪，手中的武器卷刃，盔甲破碎。但你看著身後那一雙雙渴望生存的眼睛，你知道你不能退縮。每一次揮劍，每一次施法，都是為了守護那一絲微弱的希望。絕望如同瘟疫般蔓延，但只要還有一個人站著，烽火就不會熄滅。" },
    { title: "第三章：英靈集結", content: "就在防線即將崩潰之際，奇蹟發生了。你站在尚未完工的魔法防禦塔前，感受著古老符文迴路的微弱脈動。也許是你的決心感動了上蒼，又或許是這片土地不甘就此沉淪。一道耀眼的光芒從天而降，古老的英靈殿大門在虛空中緩緩開啟。傳說中的英雄們，那些只存在於史詩和歌謠中的名字，此刻跨越了時間的長河，響應了你的召喚。赤鬼凜揮舞著燃燒的巨劍，斬斷了巨獸的獠牙；白狐雪的箭矢如同流星雨般落下，精準地穿透了每一個敵人的心臟。他們的到來，不僅帶來了強大的戰力，更點燃了所有人心中熄滅已久的勇氣之火。反擊的號角，終於吹響。" },
    { title: "第四章：深淵的凝視", content: "隨著戰鬥的深入，你逐漸意識到，這場戰爭遠比想像中更加慘烈和複雜。虛空軍團似乎無窮無盡，它們不僅在數量上佔據優勢，更在不斷進化。你遇到了一種能夠吞噬光線的暗影生物，它們在陰影中穿梭，無聲無息地收割著生命。每當你凝視深淵時，深淵也在凝視著你。戰場上的屍體如果不被及時淨化，就會在夜晚搖搖晃晃地站起來，變成新的敵人。你的精神承受著巨大的壓力，每一個決策都關乎成百上千人的生死。你開始懷疑，這場戰爭真的有盡頭嗎？但每當你看到身邊並肩作戰的伙伴，看到英靈們堅定的背影，你就會將恐懼深埋心底，繼續揮舞手中的指揮棒。" },
    { title: "第五章：新的盟友", content: "戰火將不同種族、不同信仰的人們團結在了一起。曾經高傲的精靈走出了森林，雖然他們依然不習慣人類的喧囂，但他們的自然魔法成為了戰場上最強大的治療力量。固執的矮人也打開了封閉已久的地下城門，他們帶來了精密的火炮和堅不可摧的盾牌。甚至連神秘的妖族也加入了聯軍，雖然他們行事詭異，但那變幻莫測的幻術往往能起到意想不到的效果。在一次次生死與共的戰鬥中，隔閡被打破，信任被建立。你不再是孤軍奮戰，你的身後是一支由各族精英組成的強大聯軍。這股力量，讓你堅信，勝利終將屬於艾特拉。" },
    { title: "第六章：機械城的陷落", content: "然而，命運總喜歡開殘酷的玩笑。戰火延燒到了西方的機械城——這座代表了大陸科技與魔法結合巔峰的城市。你原本指望這裡的自動化防禦系統能阻擋虛空的步伐，但當你抵達時，看到的卻是一片地獄般的景象。機械城的中央處理器被虛空能量侵蝕，曾經忠誠的守衛機器人紛紛倒戈，將槍口對準了無辜的市民。齒輪的轟鳴聲中夾雜著詭異的低語，生產線不再製造希望，而是源源不斷地組裝著殺戮機器。你必須做出一個艱難的決定：摧毀這座城市的動力核心，讓一切化為廢墟，還是冒險潛入核心區域，嘗試淨化那已經被污染的靈魂？時間不等人，每一秒都有人在死去。" },
    { title: "第七章：元素位面的崩壞", content: "虛空的觸手不僅僅在物質界肆虐，更伸向了構成這個世界基礎的元素位面。火元素界失去了控制，岩漿倒流進了河流；水元素界被污染，降下的雨水帶有強烈的腐蝕性。大自然的平衡被徹底打破，氣候變得極端惡劣。你在戰鬥中不僅要面對虛空怪物，還要應對突如其來的暴風雪、雷暴和地震。元素精靈們發出了痛苦的哀嚎，請求你的幫助。為了拯救世界，你必須帶領一支精英小隊，穿越位面之門，進入那個混亂不堪的純能量世界。在那裡，物理法則不再適用，你只能依靠對魔法的理解和堅韌的意志，去修復那些破碎的元素支柱。" },
    { title: "第八章：鏡像迷宮的考驗", content: "通往虛空裂縫核心的必經之路，是一座古老而神秘的鏡像迷宮。這裡曾是古代法師試煉心智的場所，如今卻被虛空力量扭曲成了吞噬靈魂的陷阱。迷宮中的鏡子不僅僅反射影像，它們會具現化你內心最深處的恐懼和慾望。你看見自己被隊友背叛，看見死去的親人指責你的無能，看見自己變成了一個殘暴的獨裁者。每一個轉角都可能遇見另一個自己，一個被虛空吞噬、充滿惡意的自己。這是一場沒有硝煙的戰鬥，敵人就是你自己。只有擁有最純粹、最堅定信念的人，才能看破虛妄，找到通往出口的唯一道路。" },
    { title: "第九章：終焉迴廊", content: "穿過鏡像迷宮，你們終於抵達了虛空裂縫的最邊緣——終焉迴廊。這裡的空間結構極不穩定，過去、現在和未來的影像在空中交錯閃現。你看到了這片大陸曾經的輝煌，也看到了如果不阻止虛空，未來那一片死寂的廢墟。時間在這裡失去了意義，你可能已經戰鬥了幾分鐘，也可能已經戰鬥了幾百年。每一波敵人的攻擊都比上一波更加猛烈，它們彷彿無窮無盡。你的戰友們一個接一個地倒下，彈藥耗盡，魔力枯竭。唯有意志，是你手中唯一的武器，是你心中唯一的燈塔。你告訴自己，只要還有一口氣，就絕不能倒下，因為你的身後，是整個世界。" },
    { title: "第十章：破曉之戰", content: "混沌泰坦轟然倒下，大地為之震顫。然而，這並不是結束。虛空裂縫中湧出了前所未有的強大能量，一個巨大的身影從黑暗中緩緩浮現——虛空領主。它的身軀如同黑洞般吞噬著周圍的光線，它的氣息讓空氣都為之凝固。這是最終的決戰，是黎明前最黑暗的時刻。所有的戰術，所有的計謀，在絕對的力量面前都顯得蒼白無力。你集結了所有殘存的力量，燃燒了自己的生命之火，發動了最後的衝鋒。天空中，英靈們化作流星，撞向虛空領主；地面上，戰士們用血肉之軀築起了最後的防線。為了艾特拉，為了所有犧牲的英靈，衝鋒！" },
    { title: "第十一章：深淵之底", content: "虛空領主並非孤身一人。當我們以為勝利在望時，大地裂開，露出了通往地心的深淵。無數古老的魔物從沉睡中甦醒，它們的皮膚如同黑曜石般堅硬，眼中燃燒著地獄的綠火。這些深淵魔物擁有極高的魔法抗性，普通的法術打在它們身上如同搔癢。你需要依賴物理攻擊和真實傷害來穿透它們的厚甲。同時，深淵環境中的毒氣會持續削減士兵的生命值，這對你的治療補給線提出了嚴峻的考驗。這是一場在絕境中的拉鋸戰，每前進一步都要付出血的代價。" },
    { title: "第十二章：機械城", content: "儘管我們曾試圖淨化機械城，但虛空的腐蝕比預想的更深。城市再次啟動，但這次是被虛空能量徹底重構。街道上巡邏的不再是守護者，而是裝備了虛空射線的毀滅者戰車。工廠的煙囪排放著紫色的毒霧，遮蔽了天空。這些機械單位免疫流血和毒素，並且擁有強大的遠程火力。我們必須利用城市中的掩體，進行巷戰，逐個摧毀它們的能源節點。同時，還要小心那些偽裝成普通設施的自爆無人機，它們隨時可能從角落裡衝出來，與我們同歸於盡。" },
    { title: "第十三章：死靈墓地", content: "這片古戰場埋葬著數千年來戰死的無數英雄。如今，虛空的力量喚醒了這片土地，昔日的榮耀變成了今日的夢魘。骷髏士兵、幽靈騎士、甚至骨龍都從地下爬了出來。這不僅僅是與怪物的戰鬥，更是與歷史的戰鬥。你看到了曾經崇拜的英雄的骸骨揮劍向你砍來，這對士氣是巨大的打擊。死靈法師在後方不斷復活倒下的敵人，如果不優先解決他們，這場戰鬥將永遠不會結束。我們必須懷著沉痛的心情，親手粉碎這些前輩的遺骸，讓他們得到真正的安息。" },
    { title: "第十四章：星界戰艦", content: "這艘墜落的星界戰艦是上古文明對抗虛空的最後遺產，據說內部藏有能夠逆轉戰局的星核動力爐。虛空軍團顯然也知道這一點，它們瘋狂地湧入戰艦內部，試圖奪取或摧毀動力爐。戰艦內部的防禦系統已經敵我不分，我們不僅要對抗虛空生物，還要躲避激光陷阱和防禦塔的攻擊。狹窄的通道限制了大部隊的展開，這是一場特種作戰。我們必須爭分奪秒，在動力爐過載爆炸之前，奪取控制權，或者將其安全關閉。如果失敗，爆炸的威力足以將半個大陸從地圖上抹去。" },
    { title: "第十五章：元素位面", content: "元素位面的崩潰已經到了臨界點。火元素與水元素相互吞噬，產生了毀滅性的蒸汽風暴，能瞬間蒸發任何靠近的生物。土元素的大地在崩解，風元素的氣流變成了鋒利的風刃。我們需要在這片混沌中建立秩序，重啟分佈在位面四角的元素平衡法陣。每一個法陣都有一隻強大的元素領主守護，它們已經被虛空腐蝕，變得狂暴無比。這是一場與自然之怒的對抗，我們必須利用相剋的屬性，才能有一線生機。小心腳下的路，因為下一秒它可能就會變成滾燙的岩漿。" },
    { title: "第十六章：浮空島", content: "虛空開始侵蝕天空。浮空島群原本是最後的淨土，現在卻成了空中的戰場。成群的哈比鷹人和虛空飛龍遮蔽了陽光，它們從空中俯衝而下，對我們的地面部隊造成了巨大的威脅。在這片破碎的空域中戰鬥，稍有不慎就會跌落萬丈深淵。我們需要建立強大的防空火網，並利用飛行坐騎與敵人在雲端周旋。浮空島之間的橋樑是爭奪的焦點，這些狹窄的通道易守難攻，但也意味著一旦被堵住，我們將無路可退。風，是我們唯一的盟友，也是最危險的敵人。" },
    { title: "第十七章：鏡像迷宮", content: "這裡的鏡像迷宮不僅僅是幻象，它已經實體化。鏡子中走出的複製體擁有和本體一樣的能力，甚至更加強大。你必須在無數個鏡像中分辨出真實的道路，同時防備來自背後的偷襲。迷宮的牆壁在不斷移動，原本的路口可能下一秒就變成了死胡同。這是一場智力與武力的雙重考驗。傳說迷宮中心有一面「真實之鏡」，只有打碎它，才能破解這個無限循環的死局。但要小心，打碎鏡子的同時，也可能打碎你自己的靈魂。保持清醒，不要相信你的眼睛，相信你的直覺。" },
    { title: "第十八章：混沌核心", content: "我們深入到了虛空的腹地，這裡已經不再是我們認知的世界。物理法則完全扭曲，岩漿在空中流淌，石頭像羽毛一樣飄浮，時間在這裡時快時慢。這裡是混沌泰坦的誕生地，空氣中充滿了令人瘋狂的輻射。每一步都像是在行走在刀尖上，稍有不慎就會被空間亂流撕碎。敵人可以從任何方向，甚至從你的影子裡鑽出來。在這裡，常規的戰術已經失效，我們必須隨機應變，利用環境的混亂來對抗混亂。這是對指揮官適應能力的終極考驗。" },
    { title: "第十九章：終焉迴廊", content: "這條迴廊似乎沒有盡頭，牆壁上刻滿了歷代文明毀滅的壁畫，彷彿在預示著我們的結局。這裡的時間流速極慢，外界的一天在這裡可能是一年。長期的戰鬥讓士兵們的身心都達到了極限，幻聽和幻覺開始在軍中蔓延。你必須時刻鼓舞士氣，防止隊伍崩潰。迴廊的盡頭傳來有節奏的轟鳴聲，那是虛空心臟跳動的聲音。每靠近一步，壓力就增加一分。這裡沒有退路，身後的道路在我們通過後就消失在了虛空中。我們只能向前，直到生命的最後一刻。" },
    { title: "第二十章：神之試煉", content: "這是舊神留下的最後一道防線，也是最後的試煉。傳說只有證明我們擁有超越神明的勇氣和智慧，才能獲得對抗虛空本源的力量。金色的沙漠中埋葬著無數挑戰者的骸骨，每一粒沙子都記錄著一段失敗的歷史。這裡的守護者不是虛空生物，而是上古神明的投影。它們公正無私，卻也冷酷無情。我們必須擊敗它們，獲得它們的認可。這不是為了征服，而是為了傳承。只有繼承了神明的力量，我們才有資格站在虛空領主面前，與之一戰。" },
    { title: "第二十一章：扭曲維度", content: "現實與虛幻的界線徹底崩潰。我們行走在莫比烏斯環般的路徑上，上下左右失去了意義。敵人可能從天花板上掉下來，也可能從地面下升起。空間魔法在這裡完全失效，傳送陣會將人傳送到未知的異次元。我們只能依靠最原始的刀劍和魔法，一步步殺出一條血路。這裡的顏色是扭曲的，聲音是失真的，長時間待在這裡會讓人發瘋。我們必須盡快找到維度的節點，將其破壞，強行讓空間回歸正常，否則我們將永遠迷失在這個光怪陸離的世界裡。" },
    { title: "第二十二章：絕望深坑", content: "我們被困在了一個巨大的圓形深坑底部，四周是高聳入雲的絕壁。無數的虛空怪物從上方如潮水般湧下，試圖將我們淹沒。這是一場沒有退路的背水一戰，我們無處可逃，唯有死戰。深坑的底部積滿了歷代戰死者的遺骸，空氣中瀰漫著腐朽的氣息。我們必須利用有限的資源，建立起環形防線，抵擋住一波又一波的攻勢。每一分鐘都像是一個世紀那麼漫長。這是在考驗我們的耐力，看是怪物的數量先耗盡，還是我們的意志先崩潰。" },
    { title: "第二十三章：時間迴廊", content: "這裡的時間線是錯亂的。死去的敵人會突然重新站起，被摧毀的防禦塔會瞬間恢復原狀，甚至連我們自己也會在受傷後莫名痊癒或突然重傷。這是一個時間閉環，如果不打破它，我們將永遠被困在戰鬥的輪迴中，直到耗盡最後一絲生命力。我們必須找到維持這個時間迴廊的時之沙漏，將其打破。但在這混亂的時間流中，找到一個固定的物體談何容易。每一次嘗試都可能導致時間線的進一步崩壞，我們是在與時間賽跑，也是在與命運博弈。" },
    { title: "第二十四章：英靈殿", content: "我們終於抵達了傳說中的英靈殿，但這裡已不是我們想像中的聖地，而是一片被虛空侵蝕的廢墟。原本金碧輝煌的殿堂如今佈滿了黑色的苔蘚，先祖的雕像斷裂倒塌。最令人心痛的是，虛空甚至侵蝕了英靈們的靈魂，將他們變成了強大的虛空騎士。我們不得不與曾經守護這個世界的英雄們戰鬥，這是一種精神上的折磨。但我們知道，只有擊敗他們，才能淨化他們的靈魂，讓他們重獲榮耀。這是最後的洗禮，只有通過了這裡，我們才算真正繼承了守護者的意志。" },
    { title: "第二十五章：虛空之心", content: "這是最後的決戰，一切的終點。虛空之心就在眼前，它懸浮在無盡的黑暗中，像一顆巨大的、跳動的黑色心臟。它是所有災厄的源頭，也是虛空力量的樞紐。它每一次跳動，都讓整個世界顫抖，讓離毀滅更近一步。周圍聚集了虛空軍團最強大的精銳，還有那位恐怖的虛空領主親自坐鎮。我們已經沒有退路，也沒有援軍。這是一場註定要寫入史冊的戰鬥，無論勝敗。為了艾特拉大陸的未來，為了所有犧牲的英靈，為了身後那一雙雙期盼的眼睛，燃燒吧，最後的生命之火！衝鋒！" }
];

const MainMenu: React.FC<MainMenuProps> = ({ onStart, onChangeView, onLoginAdmin, onLogoutAdmin, isAdminMode }) => {
  const [showLoreModal, setShowLoreModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const [adminError, setAdminError] = useState(false);
  const [lorePage, setLorePage] = useState(0);
  const [meteors, setMeteors] = useState<number[]>([]);
  const [stars, setStars] = useState<{id: number, x: number, y: number, size: number, opacity: number}[]>([]);

  useEffect(() => {
    const newStars = Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 60, 
      size: Math.random() * 2 + 1,
      opacity: Math.random()
    }));
    setStars(newStars);
    setMeteors(Array.from({ length: 12 }).map((_, i) => i));
  }, []);

  const handleAdminPin = (digit: string) => {
    if (adminPin.length < 4) {
      setAdminPin(prev => prev + digit);
      setAdminError(false);
    }
  };

  const clearAdminPin = () => {
    setAdminPin("");
    setAdminError(false);
  };

  const submitAdminPin = () => {
    const validCodes = ['1011', '1202', '0116'];
    if (validCodes.includes(adminPin)) {
      onLoginAdmin();
      setShowAdminLogin(false);
      setAdminPin("");
    } else {
      setAdminError(true);
      setAdminPin("");
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-900 overflow-hidden font-sans">
      <style>{`
        @keyframes meteor {
          0% { transform: rotate(215deg) translateX(0); opacity: 1; }
          70% { opacity: 1; }
          100% { transform: rotate(215deg) translateX(-1000px); opacity: 0; }
        }
        .meteor-shower {
          position: absolute;
          top: 0;
          left: 50%;
          width: 1px;
          height: 1px;
          background-color: transparent;
          transform: rotate(215deg);
        }
        .meteor {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 300px;
          height: 1px;
          background: linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 50%, rgba(255, 255, 255, 0) 100%);
          animation: meteor 5s linear infinite;
          opacity: 0;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .shake-animation {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>

      <div 
        className="absolute inset-0 z-0"
        style={{ 
            background: 'linear-gradient(to bottom, #020617 0%, #1e1b4b 40%, #312e81 70%, #4f46e5 100%)' 
        }}
      />
      
      <div className="absolute inset-0 z-0">
          {stars.map(star => (
              <div 
                key={star.id}
                className="absolute rounded-full bg-white animate-pulse"
                style={{
                    left: `${star.x}%`,
                    top: `${star.y}%`,
                    width: `${star.size}px`,
                    height: `${star.size}px`,
                    opacity: star.opacity,
                    animationDuration: `${Math.random() * 3 + 2}s`
                }}
              />
          ))}
      </div>

      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {meteors.map((m, i) => (
              <div 
                key={m}
                className="meteor"
                style={{
                    top: `${Math.random() * 50 - 20}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 10}s`,
                    animationDuration: `${Math.random() * 2 + 4}s`,
                    width: `${Math.random() * 200 + 100}px`,
                    background: `linear-gradient(to right, rgba(255, 255, 255, 0), rgba(${100 + Math.random()*155}, ${200 + Math.random()*55}, 255, 1))`
                }}
              />
          ))}
      </div>

      <div className="absolute bottom-0 left-0 w-full z-0 h-1/3">
           <svg viewBox="0 0 1440 320" className="w-full h-full preserve-3d" preserveAspectRatio="none">
               <path fill="#312e81" fillOpacity="0.5" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
               <path fill="#020617" fillOpacity="1" d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,261.3C960,256,1056,224,1152,213.3C1248,203,1344,213,1392,218.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
           </svg>
      </div>
      
      {/* Admin Button */}
      {!isAdminMode && (
        <button 
          onClick={() => setShowAdminLogin(true)}
          className="absolute top-4 right-4 z-40 p-2 bg-slate-800/50 hover:bg-slate-700 rounded-full text-slate-600 hover:text-amber-500 transition-all"
        >
          <Lock size={16} />
        </button>
      )}
      {isAdminMode && (
          <button 
            onClick={onLogoutAdmin}
            className="absolute top-4 right-4 z-40 px-3 py-1 bg-green-900/50 hover:bg-red-900/50 rounded-full text-green-400 hover:text-red-300 text-xs font-mono font-bold border border-green-700 hover:border-red-700 flex items-center gap-2 transition-all cursor-pointer group"
          >
              <Unlock size={14} className="group-hover:hidden"/> 
              <LogOut size={14} className="hidden group-hover:block"/>
              <span className="group-hover:hidden">ADMIN MODE</span>
              <span className="hidden group-hover:inline">LOGOUT</span>
          </button>
      )}

      <div className="z-10 text-center max-w-4xl px-6 flex flex-col items-center">
        <div className="mb-16 relative">
             <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full animate-pulse"></div>
             <h1 className="text-7xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-blue-300 mb-2 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)] fantasy-font tracking-widest relative z-10 animate-fade-in-up">
            蒼穹守護者
            </h1>
            <h2 className="text-xl md:text-2xl text-blue-200/80 font-light tracking-[0.8em] uppercase cinzel drop-shadow-lg animate-fade-in-up animation-delay-500">
            Legend of the Sky Guardians
            </h2>
        </div>

        <div className="flex flex-col gap-6 w-full max-w-md animate-fade-in-up animation-delay-700">
          <button 
            onClick={() => onChangeView(GameView.LEVEL_SELECT)}
            className="group relative w-full py-5 bg-gradient-to-r from-amber-600/90 to-amber-700/90 backdrop-blur-sm rounded border border-amber-400 hover:border-white transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(245,158,11,0.4)] overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <div className="flex items-center justify-center gap-4 relative z-10">
              <Sword className="w-6 h-6 text-white group-hover:rotate-45 transition-transform duration-300" />
              <span className="text-2xl font-bold text-white tracking-[0.2em]">開始戰役</span>
            </div>
          </button>

          <div className="flex gap-4">
            <button 
                onClick={() => onChangeView(GameView.BESTIARY)}
                className="flex-1 py-4 bg-slate-900/60 backdrop-blur rounded border border-slate-600 hover:bg-slate-800 hover:border-blue-400 transition-all flex items-center justify-center gap-2 group"
            >
                <BookOpen className="w-5 h-5 text-slate-400 group-hover:text-blue-300" />
                <span className="text-lg font-bold text-slate-300 group-hover:text-white tracking-widest">圖鑑</span>
            </button>

            <button 
                onClick={() => { setShowLoreModal(true); setLorePage(0); }}
                className="flex-1 py-4 bg-slate-900/60 backdrop-blur rounded border border-slate-600 hover:bg-slate-800 hover:border-blue-400 transition-all flex items-center justify-center gap-2 group"
            >
                <Scroll className="w-5 h-5 text-slate-400 group-hover:text-blue-300" />
                <span className="text-lg font-bold text-slate-300 group-hover:text-white tracking-widest">傳說</span>
            </button>
          </div>

          <button 
            onClick={() => setShowCreditsModal(true)}
            className="w-full py-4 bg-slate-900/60 backdrop-blur rounded border border-slate-600 hover:bg-slate-800 hover:border-blue-400 transition-all flex items-center justify-center gap-2 group"
          >
            <Users className="w-5 h-5 text-slate-400 group-hover:text-blue-300" />
            <span className="text-lg font-bold text-slate-300 group-hover:text-white tracking-widest">製作團隊</span>
          </button>

        </div>
      </div>
      
      <div className="absolute bottom-6 text-xs text-slate-500/50 font-mono z-10">
        Ver 1.1.0 | The Final Stand
      </div>

      {showAdminLogin && (
          <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center animate-fade-in">
              <div className="bg-slate-900 border-2 border-slate-600 rounded-xl p-8 w-80 shadow-2xl relative flex flex-col items-center">
                  <button onClick={() => setShowAdminLogin(false)} className="absolute top-2 right-2 text-slate-500 hover:text-white"><Unlock size={16}/></button>
                  <h3 className="text-amber-500 font-bold mb-6 flex items-center gap-2"><Lock size={18}/> 安全認證</h3>
                  
                  <div className={`w-full bg-black/50 border border-slate-700 p-3 mb-6 rounded text-center text-2xl font-mono tracking-[0.5em] text-white h-14 ${adminError ? 'shake-animation border-red-500 text-red-500' : ''}`}>
                      {adminPin.padEnd(4, '•').substring(0, 4)}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 w-full mb-4">
                      {[1,2,3,4,5,6,7,8,9].map(num => (
                          <button 
                            key={num} 
                            onClick={() => handleAdminPin(num.toString())}
                            className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded border border-slate-700 active:scale-95 transition-all"
                          >
                              {num}
                          </button>
                      ))}
                      <button onClick={clearAdminPin} className="bg-red-900/50 hover:bg-red-900 text-red-200 font-bold py-3 rounded border border-red-800">C</button>
                      <button onClick={() => handleAdminPin('0')} className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded border border-slate-700">0</button>
                      <button onClick={submitAdminPin} className="bg-green-900/50 hover:bg-green-900 text-green-200 font-bold py-3 rounded border border-green-800">OK</button>
                  </div>
              </div>
          </div>
      )}
      
      {/* Credits Modal */}
      {showCreditsModal && (
        <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center animate-fade-in">
            <div className="bg-slate-900 border-2 border-slate-600 rounded-xl p-8 w-96 shadow-2xl relative flex flex-col items-center">
                <button onClick={() => setShowCreditsModal(false)} className="absolute top-2 right-2 text-slate-500 hover:text-white"><X size={16}/></button>
                <h3 className="text-amber-500 font-bold mb-8 flex items-center gap-2 text-2xl"><Users size={24}/> 製作人員</h3>
                
                <div className="space-y-6 w-full text-center">
                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                        <div className="text-slate-400 text-xs uppercase mb-1">Created By</div>
                        <div className="text-2xl font-bold text-white">瘋魂</div>
                        //SB
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                        <div className="text-slate-400 text-xs uppercase mb-1">Co-Creator</div>
                        <div className="text-2xl font-bold text-white">白無痕</div>
                        // 這位是gay
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                        <div className="text-slate-400 text-xs uppercase mb-1">Co-Creator</div>
                        <div className="text-2xl font-bold text-white">WRAITHON</div>
                        //I am good hacker
                    </div>
                </div>
                
                <button 
                    onClick={() => setShowCreditsModal(false)}
                    className="mt-8 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-600"
                >
                    關閉
                </button>
            </div>
        </div>
      )}

      {showLoreModal && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
              <div className="bg-slate-900/90 border border-blue-500/30 p-8 max-w-3xl w-full rounded-lg shadow-[0_0_50px_rgba(59,130,246,0.2)] relative overflow-hidden flex flex-col h-[80vh]">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                  
                  <h3 className="text-2xl font-bold text-blue-400 mb-2 fantasy-font text-center tracking-widest">艾特拉編年史</h3>
                  
                  <div className="flex-1 flex flex-col items-center overflow-hidden">
                      <div className="w-full text-center border-b border-slate-700/50 pb-4 mb-4">
                          <h4 className="text-xl text-amber-500 font-bold">{LORE_CHAPTERS[lorePage].title}</h4>
                      </div>
                      <div className="flex-1 w-full overflow-y-auto custom-scrollbar bg-black/40 rounded border border-slate-800/50 p-6">
                          <div className="text-lg text-slate-300 leading-loose font-serif text-justify whitespace-pre-line tracking-wide">
                            {LORE_CHAPTERS[lorePage].content}
                          </div>
                      </div>
                  </div>

                  <div className="flex items-center justify-between mt-6">
                      <button 
                        onClick={() => setLorePage(p => Math.max(0, p - 1))}
                        disabled={lorePage === 0}
                        className={`flex items-center gap-2 px-4 py-2 rounded ${lorePage === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-blue-400 hover:bg-slate-800'}`}
                      >
                          <ChevronLeft size={20} /> 上一章
                      </button>
                      
                      <div className="flex gap-2">
                          <span className="text-slate-500 text-sm">Chapter {lorePage + 1} / {LORE_CHAPTERS.length}</span>
                      </div>

                      <button 
                        onClick={() => setLorePage(p => Math.min(LORE_CHAPTERS.length - 1, p + 1))}
                        disabled={lorePage === LORE_CHAPTERS.length - 1}
                        className={`flex items-center gap-2 px-4 py-2 rounded ${lorePage === LORE_CHAPTERS.length - 1 ? 'text-slate-600 cursor-not-allowed' : 'text-blue-400 hover:bg-slate-800'}`}
                      >
                          下一章 <ChevronRight size={20} />
                      </button>
                  </div>

                  <button 
                    onClick={() => setShowLoreModal(false)}
                    className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded border border-slate-600 transition-colors text-sm"
                  >
                    關閉卷軸
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default MainMenu;