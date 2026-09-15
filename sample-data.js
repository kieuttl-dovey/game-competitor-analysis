window.DEFAULT_PROJECT = {
  version: 1,
  projectName: "Cooking Order Puzzle — Competitor Analysis",
  originalIdea: {
    workingTitle: "Original prototype — Cooking Order Puzzle",
    genrePlatform: "Casual Puzzle / Cooking / Mobile Portrait",
    coreMechanic: "Customer order → xác định ingredient cần tìm → tap/chọn đúng ingredient tile trên grid để fulfill order.",
    coreLoop: "Nhận order → tìm/chọn ingredient → complete dish/order → serve customer → chuyển sang customer tiếp theo → clear level.",
    metaProgression: "Level-based progression (video thể hiện Lv1–3); số order/customer cần xử lý tăng theo level. Meta ngoài core chưa được thể hiện.",
    audienceTheme: "Casual puzzle audience; cooking/restaurant fantasy; motivation chính là fulfill order và phục vụ customer.",
    uspHook: "Cooking theme nối trực tiếp với puzzle: order tạo mục tiêu, ingredient grid là task xử lý; flow dễ hiểu và không bị gượng.",
    monetExpected: "Chưa xác định từ gameplay original. Có CTA 'FREE' ở extra customer slot nhưng video chưa đủ để kết luận đó là Rewarded Ad/IAP."
  },
  competitors: [
    {
      id: "comp-01",
      name: "Happy Restaurant 3D",
      identification: {
        storeLink: "Chưa có official store link — evidence từ gameplay/screenshot user cung cấp",
        platform: "Mobile dọc; chưa xác minh OS",
        publisher: "DRAGONVALE LIMITED",
        genre: "Casual 3D puzzle / cooking / object search",
        marketSignal: "$1.09M rev/30d; ~486K downloads; RPD all-time $1.32 Global / $3.6 Tier-1 West (market data user cung cấp)",
        sourceEvidence: "Gameplay video + screenshots feature/IAP + market data screenshot + 2 top creative videos + observation gameplay user cung cấp",
        marketFocus: "Chưa xác minh",
        lastChecked: "2026-09-14"
      },
      why: {
        reason: "Direct competitor ở core gameplay và cách dùng theme: cả hai đều dùng customer order để tạo target, player tìm ingredient để complete dish/order. Happy Restaurant dùng 3D clutter search; original dùng grid/tile search.",
        similarity: "Cùng flow Order → xác định ingredient → tìm/chọn trên board → fulfill dish → serve/next customer. Cùng cooking/restaurant fantasy và cùng biến ingredient-search thành task có mục đích.",
        difference: "Khác cách thể hiện và cảm giác chơi: original dùng grid/tile rõ state và ít che khuất; Happy Restaurant dùng 3D clutter/visual search, feedback/clear payoff mạnh hơn và đã có Meta/LiveOps/Monet sâu hơn."
      },
      factors: {
        coreMechanic: { score: 4, analysis: "Cùng logic order-driven ingredient search. Original dùng grid/tile rõ ràng; Happy Restaurant dùng 3D clutter/visual search. Điểm đáng học là mỗi thao tác tìm item đều gắn trực tiếp với mục tiêu hoàn thành món, nên gameplay không bị gượng." },
        coreLoop: { score: 5, analysis: "Cùng flow Order → xác định nguyên liệu → tìm/chọn trên board → hoàn thành món → serve/next customer → clear level. Happy Restaurant còn để reward từ core level cộng tiến độ cho nhiều Meta/Event, giúp một lần chơi phục vụ nhiều mục tiêu." },
        metaProgression: { score: null, analysis: "Happy Restaurant có 7-Day Login, Balloon Rise, Dream Carnival (Merge), Mole Race và Piggy Bank. Mỗi feature tạo một lý do quay lại khác nhau: nhận thưởng, giữ streak, chơi mode phụ, cạnh tranh hoặc tích lũy value. Original hiện chưa có đủ dữ liệu Meta để chấm mức độ giống." },
        audienceTheme: { score: 5, analysis: "Cùng casual puzzle + cooking/restaurant fantasy. Customer order món → player tìm nguyên liệu → hoàn thành món, nên mục tiêu puzzle matching tự nhiên với nhu cầu của dòng cooking/time-management." },
        usp: { score: 4, analysis: "Điểm mạnh không chỉ là mechanic tìm item mà là cách nối Order → Find ingredients → Complete/Serve thành một flow hoàn chỉnh. Order phía trên giải thích vì sao player phải tìm item; thao tác tìm nguyên liệu không bị gượng. Happy Restaurant có cảm giác hoàn chỉnh hơn nhờ feedback và payoff khi complete/serve rõ hơn." },
        creatives: { score: 4, analysis: "Hai top creative đều đánh mạnh vào cooking/time-management fantasy hơn là object-search thuần. Creative 01 (Japanese Greengrocer): customer → order → scan quầy nhiều item → tìm đúng → clear dần → fail. Creative 02 (Sandwich Store): customer → order → tìm food/drink trên shelf → fulfill → khách tiếp theo → fail. Điểm nên học: bán cảm giác phục vụ order để video dễ hiểu ngay." },
        store: { score: null, analysis: "Chưa có đủ store asset để chấm similarity. Cần check icon, screenshot và title đang bán cooking/restaurant, visual search hay puzzle challenge." },
        monetization: { score: null, analysis: "Hybrid IAA + IAP. Interstitial bắt đầu khoảng Level 15; sau đó gần như clear 1 level = 1 interstitial. Rewarded Ads gắn với độ khó; placement nổi bật là thêm khách hàng, cap 5 lần/ngày. IAP có Dream Pass, Event Pack, bundle, tiered pack, BOGO, Piggy Bank và gói gem/booster/life/event currency. Original chưa có đủ dữ liệu monet để chấm mức độ giống." },
        balance: { score: null, analysis: "Game bắt đầu khó rõ từ khoảng Level 20, chia Normal / Hard / Super Hard. Hard thường cần retry; Super Hard tăng nhu cầu booster/RV/IAP. Độ khó nối với Economy + LiveOps: level khó → cần thêm resource → nhận reward từ Event/Meta hoặc ads/IAP → quay lại vượt level. Original chưa có đủ dữ liệu balance để chấm mức độ giống." },
        traction: { score: 5, analysis: "Dữ liệu user cung cấp cho thấy market signal mạnh: khoảng $1.09M revenue/30 ngày, 486,067 downloads/30 ngày; RPD all-time $1.32 Global và $3.6 Tier-1 West. Đủ mạnh để dùng làm mốc tham khảo về thị trường." }
      },
      learning: {
        learn: "Giữ cách nối customer order → tìm nguyên liệu → hoàn thành món vì rất dễ hiểu và đúng với theme cooking. Nên học thêm cách làm feedback khi tap/complete/serve rõ hơn, cùng cách dùng Meta/Event để tạo thêm lý do quay lại chơi.",
        avoid: "Không cần copy board 3D quá rối, độ khó tăng quá nhanh, tần suất gần 1 interstitial/level hoặc mở quá nhiều event cùng lúc. Original đang có lợi thế board grid/tile dễ đọc hơn.",
        impact: "Giữ core gameplay hiện tại. Nên làm rõ hơn cảm giác phục vụ khách và hoàn thành món; sau khi core ổn mới bổ sung Meta/Event, reward và monetization để sản phẩm đầy đủ hơn. Creative nên tập trung vào cooking/time-management service flow thay vì quảng cáo như tile puzzle thuần.",
        risk: "Board grid/tile dễ đọc nhưng có thể tạo cảm giác giống puzzle thông thường nếu phần order, serve và feedback chưa đủ nổi bật. Khi đó người chơi có thể không cảm nhận rõ đây là một cooking/service game.",
        conclusion: "Happy Restaurant 3D là direct competitor ở core loop, audience và cooking flow. Nên dùng làm tham khảo cho cách nối gameplay với theme cooking, cảm giác chơi, Meta/Event và monetization; original vẫn nên giữ lợi thế board/grid rõ ràng và cách thể hiện riêng.",
        sources: "Nguồn user cung cấp: original gameplay video (Lv1–3); Happy Restaurant gameplay video; ảnh LiveOps/IAP/ads; 2 top creative videos; ảnh market data. Các phần Meta/Store/Monet/Balance của original chưa có đủ dữ liệu nên chưa chấm mức độ giống."
      }
    }
  ],
  ideaAdjustment: {
    rows: [
      { category:"Core Gameplay", originalKey:"coreMechanic", competitorsDoing:"Cùng kiểu customer order → tìm nguyên liệu. Happy Restaurant dùng board 3D nhiều item; original dùng grid/tile dễ đọc hơn.", action:"KEEP", suggestion:"Giữ grid/tile ingredient search và objective theo order; tăng feedback khi chọn đúng và khi hoàn thành món.", references:"Happy Restaurant 3D", rationale:"Core đã dễ hiểu và hợp với theme cooking; không cần đổi mechanic chỉ để giống competitor.", priority:"P0" },
      { category:"Core Loop", originalKey:"coreLoop", competitorsDoing:"Cùng flow Order → tìm ingredient → complete dish → serve/next customer. Happy Restaurant còn dùng reward từ level để cộng tiến độ cho nhiều Event.", action:"KEEP", suggestion:"Giữ core loop hiện tại; sau này có thể để reward từ level đồng thời cộng tiến độ cho Meta/Event.", references:"Happy Restaurant 3D", rationale:"Core loop đã rõ; một lần clear level có thể phục vụ thêm nhiều mục tiêu mà không làm gameplay chính rối hơn.", priority:"P0" },
      { category:"Meta / Progression", originalKey:"metaProgression", competitorsDoing:"Competitor có Login, Balloon Rise, Merge event, Race và Piggy Bank để tạo thêm lý do quay lại chơi.", action:"ADD", suggestion:"Sau khi core ổn, bổ sung 1–2 Meta/Event trước; không cần mở nhiều hệ thống cùng lúc.", references:"Happy Restaurant 3D", rationale:"Original hiện mới có level progression; còn thiếu mục tiêu phụ và lý do quay lại ngoài core level.", priority:"P1" },
      { category:"Audience / Theme", originalKey:"audienceTheme", competitorsDoing:"Cùng casual puzzle + cooking/restaurant. Customer order giải thích trực tiếp vì sao player phải tìm ingredient.", action:"KEEP", suggestion:"Giữ cooking/restaurant theme và flow phục vụ khách làm hướng chính.", references:"Happy Restaurant 3D", rationale:"Theme và gameplay nối tự nhiên, giúp người chơi hiểu mục tiêu ngay.", priority:"P0" },
      { category:"USP / Positioning", originalKey:"uspHook", competitorsDoing:"Competitor có cảm giác sản phẩm hoàn chỉnh hơn nhờ order rõ, tap có phản hồi nhanh và complete/serve có payoff.", action:"CHANGE", suggestion:"Đẩy idea theo hướng “cooking service puzzle”: order → tìm nguyên liệu → complete/serve, với feedback rõ ở từng bước.", references:"Happy Restaurant 3D", rationale:"Original có logic tốt nhưng có thể bị nhìn như tile puzzle nếu phần cooking/serve chưa đủ nổi bật.", priority:"P0" },
      { category:"Creative / UA", originalKey:null, current:"Chưa xác định", competitorsDoing:"Top creatives bán cooking/time-management flow: customer → order → tìm item → fulfill → khách tiếp theo.", action:"ADD", suggestion:"Creative nên ưu tiên flow phục vụ khách; dùng board nhiều item + khoảnh khắc fulfill/serve làm điểm hút.", references:"Happy Restaurant 3D", rationale:"Fantasy cooking quen thuộc giúp người xem hiểu video nhanh hơn so với quảng cáo như puzzle thuần.", priority:"P0" },
      { category:"Monetization", originalKey:"monetExpected", competitorsDoing:"Competitor dùng Hybrid IAA + IAP: interstitial sau early game, Rewarded Ads hỗ trợ lúc khó, IAP/pass/bundle gắn với Event và progress.", action:"ADD", suggestion:"Sau khi core ổn mới thiết kế monet: Interstitial, Rewarded Ads hỗ trợ khi khó và IAP gắn với resource/booster/pass/event. Không copy gần 1 interstitial/level.", references:"Happy Restaurant 3D", rationale:"Original chưa có hướng monet rõ; competitor cho thấy ads/IAP hiệu quả hơn khi gắn với độ khó, resource và Event.", priority:"P1" },
      { category:"Balance / Economy", originalKey:null, current:"Chưa xác định", competitorsDoing:"Game khó rõ từ khoảng Lv20; Hard/Super Hard làm player retry và cần thêm resource; Event/Meta trả reward quay lại hỗ trợ core.", action:"ADD", suggestion:"Thiết kế độ khó theo từng giai đoạn: đầu game dễ → giữa game bắt đầu retry → level khó tạo nhu cầu resource; Event/Meta phải có reward hỗ trợ người chơi vượt level.", references:"Happy Restaurant 3D", rationale:"Challenge cần đi cùng cách hỗ trợ; nếu chỉ tăng khó sẽ dễ làm người chơi bỏ.", priority:"P1" }
    ],
    topChanges: [
      { title:"Làm rõ cảm giác complete/serve để cooking theme nổi bật hơn", action:"CHANGE", reference:"Happy Restaurant 3D", why:"Core đúng nhưng có thể giống tile puzzle nếu feedback và khoảnh khắc serve chưa đủ rõ.", expected:"Game dễ hiểu hơn, cảm giác hoàn thành món rõ và satisfying hơn.", test:"Prototype 3 mức feedback: chọn ingredient / complete dish / serve customer; user test độ dễ hiểu và cảm giác thỏa mãn.", priority:"P0" },
      { title:"Creative tập trung vào flow phục vụ khách kiểu Cooking / Time-management", action:"ADD", reference:"Happy Restaurant 3D – Top Creative 01/02", why:"Top creatives cho thấy Order → Fulfill → Next customer dễ hiểu và dễ quảng cáo hơn visual-search thuần.", expected:"Creative dễ hiểu hơn và có thêm nhiều hướng test.", test:"Test 2 hướng: service flow vs puzzle-first; so CTR/IPM/CVR.", priority:"P0" },
      { title:"Bổ sung Meta/Event + cách hỗ trợ khi level khó + monetization sau khi core ổn", action:"ADD", reference:"Happy Restaurant 3D", why:"Original mới thể hiện core level; competitor cho thấy game đơn giản cần thêm mục tiêu phụ, reward và cách hỗ trợ người chơi khi khó.", expected:"Tăng lý do quay lại chơi và tạo điểm xem ads/mua hàng tự nhiên hơn.", test:"Thiết kế 1 event giữ chân + 1 event streak + 1 Rewarded Ads support; theo dõi D1/D3/D7, tỷ lệ tham gia event và sử dụng RV.", priority:"P1" }
    ],
    final: {
      summary:"Giữ core tìm nguyên liệu theo order trên grid và theme cooking/restaurant. Làm rõ flow Order → Find → Complete/Serve bằng feedback tốt hơn; creative tập trung vào cảm giác phục vụ khách thay vì tile puzzle thuần. Sau khi core ổn, bổ sung Meta/Event, độ khó theo giai đoạn và Hybrid IAA+IAP để hỗ trợ progression; không copy nguyên tần suất ads hoặc số lượng event của competitor.",
      keep:"Core ingredient-search trên grid; order-driven objective; cooking/restaurant fantasy; readability của board.",
      add:"Cảm giác complete/serve; creative theo cooking/time-management; Meta/Event; cách hỗ trợ khi level khó; Hybrid IAA+IAP sau khi core ổn.",
      change:"Định vị từ “tile/ingredient puzzle” → “cooking service puzzle”; reward sau level có thể đồng thời cộng tiến độ cho nhiều Meta/Event.",
      remove:"Không copy board 3D quá rối, tăng độ khó quá sớm, gần 1 interstitial mỗi level hoặc mở quá nhiều event ngay từ đầu.",
      reference:"Happy Restaurant 3D — tham khảo cho cooking flow, cảm giác chơi, creative, Meta/Event và monetization/balance.",
      call:"ITERATE IDEA",
      nextTest:"Prototype cảm giác complete/serve → test 2 creative angles → thiết kế 1–2 Meta/Event cho D0–D7 → sau đó mới chốt balance/monet."
    }
  }
};
