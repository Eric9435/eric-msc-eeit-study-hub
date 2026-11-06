/* Original, accessible engineering diagrams for Eric EEIT; no copyrighted question figures. */
const createVisualEngine = (function createVisualEngine(){
  const map = new Map();
  const assign=(kind,ids)=>ids.trim().split(/\s+/).forEach(id=>{if(map.has(id))throw Error('Duplicate visual mapping '+id);map.set(id,kind);});
  assign('iq','dc-1.1 dc-2.1');
  assign('noise','dc-1.3');
  assign('ber','dc-2.2 practice-dc-bpsk');
  assign('rotation','dc-2.3');
  assign('dapsk','dc-2.5');
  assign('fsk','dc-2.6');
  assign('msk','dc-2.7');
  assign('fir','dc-3.1');
  assign('viterbi','dc-3.2 dc-3.3');
  assign('ofdm','dc-4.1 practice-dc-ofdm');
  assign('numerology','dc-4.2');
  assign('cp','dc-4.3');
  assign('cdma','dc-5.1');
  assign('rayleigh','practice-dc-rayleigh source-dc-1-4');
  assign('baseband','source-dc-1-2');
  assign('differential','source-dc-2-4');
  assign('perunit','practice-eps-per-unit source-eps-ex-05 original-p1');
  assign('powertriangle','original-p2');
  assign('transformer','source-eps-ex-04 source-eps-ex-09 original-p4');
  assign('bus','source-eps-bus source-eps-ex-06 source-eps-ex-08 original-p3');
  assign('newton','source-eps-nr source-eps-ex-07');
  assign('dispatch','source-eps-dispatch');
  assign('fault','source-eps-ex-10');
  assign('sequence','source-eps-ex-11');
  assign('wls','source-eps-ex-12');
  assign('statespace','practice-control-state official-cstd-I2 original-c1');
  assign('eigen','official-cstd-I1 original-c3');
  assign('superposition','official-cstd-I3');
  assign('transfer','official-cstd-I4');
  assign('pendulum','official-cstd-I5');
  assign('jordan','official-cstd-I6');
  assign('controllability','original-c2');
  assign('feedback','original-c4');
  assign('chain','official-mw-1-1 official-mw-1-2 original-m3');
  assign('coax','official-mw-1-3');
  assign('transmission','official-mw-2-1 official-mw-2-2 official-mw-2-3 original-m1');
  assign('smith','official-mw-2-4 official-mw-2-5 original-m2 practice-mw-matching');
  assign('twoport','official-mw-3-1 official-mw-3-2 official-mw-3-3 official-mw-3-4');
  assign('noisechain','official-mw-4-1 official-mw-4-2 official-mw-4-3');
  assign('coupler','official-mw-5-1 official-mw-5-3');
  assign('bridge','official-mw-5-2');
  assign('waveguide','original-m4');
  assign('cap','practice-micro-cap original-mse3');
  assign('etch','practice-mse-etch');
  assign('spring','practice-mse-spring original-mse2');
  assign('gauge','practice-mse-piezoresistive');
  assign('thermal','practice-mse-thermal original-mse4');
  assign('diffusion','practice-mse-diffusion');
  assign('cantilever','original-mse1');
  const names={
    iq:['I/Q constellation & waveform','A demonstration of in-phase and quadrature symbols.'],
    noise:['Noise PSD and autocorrelation','Gaussian-noise spectral density and associated correlation.'],
    ber:['BER against Eᵦ/N₀','AWGN error probability shown on a logarithmic vertical scale.'],
    rotation:['Carrier phase-offset geometry','The received constellation rotates if the local oscillator phase differs.'],
    dapsk:['Differential amplitude & phase states','Two signal rings and adjacent Gray-coded phase locations.'],
    fsk:['Binary frequency-shift keying','Continuous-phase tone changes over several symbols.'],
    msk:['MSK phase trajectory','Each ±1 symbol changes continuous phase by ±π/2.'],
    fir:['FIR channel and equalizer','A tapped delay line and its impulse response.'],
    viterbi:['Viterbi trellis','State transitions for a two-symbol-memory BPSK channel.'],
    ofdm:['OFDM orthogonal subcarriers','Overlapping sinc² spectra sampled at other subcarrier centers.'],
    numerology:['5G subcarrier numerology','Increasing μ doubles spacing and halves useful symbol duration.'],
    cp:['Cyclic prefix & channel memory','The last samples are copied before the OFDM payload.'],
    cdma:['CDMA spreading sequence','One data symbol spreads to multiple chips before correlation.'],
    rayleigh:['Rayleigh envelope distribution','Theoretical fading-envelope probability density.'],
    baseband:['Baseband symbols and sampling','Illustrative sampled symbols and a rectangular pulse response.'],
    differential:['Differential phase coding','Absolute phase is unnecessary when phase changes are detected.'],
    perunit:['Per-unit conversion flow','Voltage, power and impedance are normalized by consistent bases.'],
    powertriangle:['Three-phase P–Q–S triangle','Real, reactive and apparent power relation.'],
    transformer:['Transformer tap & phase shift','A complex off-nominal tap rotates/scales voltage phasors.'],
    bus:['Network buses and branches','Bus types and Y-bus connectivity; conceptual network, not source topology.'],
    newton:['Power-flow Newton iteration','Solve mismatch with Jacobian to update the voltage state.'],
    dispatch:['Economic dispatch','Incremental generation costs are balanced across generators.'],
    fault:['Three-phase short-circuit phasors','Balanced phases are separated by 120 degrees.'],
    sequence:['Symmetrical component networks','Positive-, negative- and zero-sequence representations.'],
    wls:['Weighted least squares estimator','Measurements, residuals and weighted correction loop.'],
    statespace:['State-space signal flow','Dynamics ẋ=Ax+Bu and measurement y=Cx+Du.'],
    eigen:['Poles and stability plane','Real parts of the eigenvalues determine exponential stability.'],
    superposition:['Linear system superposition','Response to u₁+u₂ is the sum of individual responses.'],
    transfer:['Transfer-function flow','Input-to-output relation of a linear feedback-free state model.'],
    pendulum:['Pendulum equilibrium and restoring torque','The nonlinear −sinθ restoring action.'],
    jordan:['Jordan chain structure','A Jordan block has repeated eigenvalues with superdiagonal ones.'],
    controllability:['Controllability matrix','Columns B, AB, A²B, … determine reachable state directions.'],
    feedback:['Closed-loop state feedback','The gain K changes the eigenvalues of A−BK.'],
    chain:['Microwave gain / loss cascade','Add dB gain and subtract cable/filter attenuation.'],
    coax:['Coaxial TEM geometry','Radial electric field and circumferential magnetic field.'],
    transmission:['Transmission-line reflections','Forward plus reflected traveling waves.'],
    smith:['Smith chart reflection plane','Γ=(z−1)/(z+1); load point and constant-|Γ| circle.'],
    twoport:['Two-port scattering waves','Incoming a and outgoing b waves connected by S-parameters.'],
    noisechain:['RF noise cascade','Loss, gain and noise contribution throughout a receiver chain.'],
    coupler:['Directional coupler','Four-port idealized input, through, coupled and isolated ports.'],
    bridge:['Amplifier bridge','Two parallel amplification paths and recombination.'],
    waveguide:['Rectangular TE₁₀ pattern','First transverse field mode and broad-wall dimension a.'],
    cap:['Parallel-plate MEMS capacitor','Capacitance grows as electrode separation decreases.'],
    etch:['Silicon micromachining cross-section','Etch depth grows with rate × time.'],
    spring:['MEMS spring–mass oscillator','Proof mass deflection and resonant-frequency relationship.'],
    gauge:['Piezoresistive sensing','Resistance varies with strain via the gauge factor.'],
    thermal:['Thermal expansion','A solid elongates with ΔT under unconstrained expansion.'],
    diffusion:['Diffusion concentration profile','A Gaussian-like diffusion profile broadens as √t.'],
    cantilever:['MEMS cantilever beam','Beam-tip displacement under an end load.']
  };
  const E=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const ink='#173c65',blue='#2e76b6',green='#16835b',orange='#ac6e18',gray='#7890a5',light='#e5edf4',purple='#7862b0';
  const g=(x,y,r,fill='none',stroke=ink,sw=2)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
  const L=(x1,y1,x2,y2,c=ink,w=2,dash='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
  const R=(x,y,w,h,fill='none',stroke=ink,rad=7)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rad}" fill="${fill}" stroke="${stroke}" stroke-width="1.6"/>`;
  const T=(x,y,label,size=13,color=ink,anchor='middle')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" text-anchor="${anchor}" font-family="Arial, Helvetica, sans-serif">${E(label)}</text>`;
  const P=(d,color=blue,w=2,fill='none')=>`<path d="${d}" stroke="${color}" stroke-width="${w}" fill="${fill}" stroke-linejoin="round" stroke-linecap="round"/>`;
  const dot=(x,y,color=blue,r=5)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" stroke="#fff" stroke-width="1.5"/>`;
  const arrow=(x1,y1,x2,y2,color=blue)=>L(x1,y1,x2,y2,color,2)+P(`M${x2-8} ${y2-5} L${x2} ${y2} L${x2-8} ${y2+5}`,color,2);
  const pathOf=(pts,color=blue,w=2)=>P('M'+pts.map(([x,y])=>`${x.toFixed(2)} ${y.toFixed(2)}`).join(' L'),color,w);
  const plot=(f,opt={})=>{
    const x0=65,y0=33,w=540,h=183,{minX=0,maxX=6,minY=0,maxY=1.2,color=blue,labelX='x',labelY='y',n=170}=opt;
    let a=L(x0,y0+h,x0+w,y0+h,gray,1.2)+L(x0,y0,x0,y0+h,gray,1.2);
    for(let j=0;j<=4;j++){const y=y0+h-j*h/4;a+=L(x0,y,x0+w,y,light,1)+T(x0-8,y+5,(minY+(maxY-minY)*j/4).toFixed(1),11,gray,'end');}
    for(let j=0;j<=6;j++){const x=x0+j*w/6;a+=L(x,y0,x,y0+h,light,1)+T(x,y0+h+19,(minX+(maxX-minX)*j/6).toFixed(1),11,gray);}
    const pts=[];for(let i=0;i<=n;i++){const x=minX+(maxX-minX)*i/n;const v=Number(f(x));if(Number.isFinite(v)){const cy=y0+h-(v-minY)/(maxY-minY)*h;pts.push([x0+w*i/n,Math.min(y0+h,Math.max(y0,cy))]);}}
    return a+pathOf(pts,color,2.6)+T(620,y0+h+20,labelX,12,gray,'end')+T(18,22,labelY,12,gray,'start');
  };
  const frame=(title,desc,body)=>`<svg class="eeit-viz-svg" viewBox="0 0 680 260" role="img" aria-label="${E(title)}" xmlns="http://www.w3.org/2000/svg"><title>${E(title)}</title><desc>${E(desc)}</desc><rect x="1" y="1" width="678" height="258" rx="12" fill="transparent"/>${body}</svg>`;
  const range=(kind)=>{
    if(['rotation','dapsk','fsk','msk','transformer','fault','pendulum','eigen'].includes(kind))return {min:0,max:90,step:5,value:30,label:'Angle / phase illustration (°)'};
    if(['noise','ber','rayleigh','ofdm','numerology','cp','transmission','smith','chain','noisechain','cap','spring','gauge','thermal','diffusion','cantilever','etch','dispatch'].includes(kind))return {min:10,max:90,step:5,value:40,label:'Explore scenario (%)'};
    return null;
  };
  function visualKindFor(ex){return map.get(ex?.id)||({digital:'baseband',power:'bus',control:'statespace',microwave:'twoport',micro:'spring'}[ex?.subject]||'baseband');}
  function drawing(kind,value=40){
    const k=Math.max(0,Math.min(100,Number(value)||0)),a=Math.PI*k/180,eff=Math.max(.08,k/100);
    switch(kind){
      case 'iq':{
        let b=L(65,128,610,128,gray)+L(340,22,340,231,gray)+T(614,120,'I',15)+T(352,24,'Q',15);
        for(const [x,y,tag] of [[255,53,'01'],[425,53,'00'],[255,203,'11'],[425,203,'10']])b+=dot(x,y,blue,9)+T(x+17,y-12,tag,13);
        b+=P('M425 53 L255 203 L255 53 L425 203',green,2)+T(340,247,'QPSK symbol transitions · example mapping',12,gray);return b;
      }
      case 'noise':return plot(x=>Math.exp(-((x-3)**2)/(0.35+eff*1.1)),{minX:0,maxX:6,minY:0,maxY:1.3,labelX:'f',labelY:'PSD'})+T(455,52,'band-limited noise',14,ink);
      case 'rayleigh':{const s=.55+eff*1.5;return plot(x=>x/(s*s)*Math.exp(-x*x/(2*s*s)),{minX:0,maxX:5,minY:0,maxY:1.1,labelX:'r / σ₀',labelY:'f(r)'})+T(480,53,'f(r)=r/σ² · exp(−r²/2σ²)',13,ink);}
      case 'ber':{
        const erfc=x=>{const z=Math.abs(x),t=1/(1+.3275911*z),p=(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-.284496736)*t+.254829592)*t;const erf=1-p*Math.exp(-z*z);return 1-(x<0?-erf:erf);};
        let b=plot(x=>-Math.log10(Math.max(1e-8,.5*erfc(Math.sqrt(x/2+eff)))),{minX:0,maxX:16,minY:0,maxY:8,labelX:'Eᵦ/N₀ (dB) schematic',labelY:'−log₁₀ Pᵦ'})+T(440,48,'lower BER → higher on plot',13,ink);return b;
      }
      case 'rotation':{
        let b=L(90,132,590,132,gray)+L(340,18,340,239,gray)+g(340,132,90,'none',light,1);
        for(const [s,t] of [[1,1],[-1,1],[-1,-1],[1,-1]]){const x=340+s*64,y=132-t*64;const xx=340+s*64*Math.cos(a)+t*64*Math.sin(a),yy=132-(t*64*Math.cos(a)-s*64*Math.sin(a));b+=dot(x,y,gray,5)+dot(xx,yy,blue,7)+L(x,y,xx,yy,orange,1.4);}
        return b+T(340,246,'Gray = transmitted · blue = received (phase offset)',13,gray);
      }
      case 'dapsk':{
        let b=L(90,129,590,129,gray)+L(340,12,340,246,gray);
        for(const r of [50,92]){b+=g(340,129,r,'none',r===50?green:blue,1.7);for(let j=0;j<8;j++){const x=340+r*Math.cos(j*Math.PI/4),y=129-r*Math.sin(j*Math.PI/4);b+=dot(x,y,r===50?green:blue,4);}}
        return b+T(448,47,'ring radius 1',12,green)+T(448,61,'ring radius a > 1',12,blue)+T(340,250,'Relative phase: increments of π/4',12,gray);
      }
      case 'fsk':{
        let b=L(55,130,640,130,gray,1);
        const bits=[1,-1,1,1,-1,-1],pts=[];
        let ph=0;for(let i=0;i<=480;i++){const bit=bits[Math.min(5,Math.floor(i/80))],dt=.035;ph+=(bit>0?0.26:0.16);pts.push([65+i*1.12,130-53*Math.sin(ph)]);}
        for(let j=0;j<=6;j++)b+=L(65+80*j*1.12,45,65+80*j*1.12,212,light,1.4)+T(65+80*j*1.12+35,233,bits[j]===undefined?'':bits[j]===1?'+1':'−1',12,gray);
        return b+pathOf(pts,blue,2)+T(560,28,'continuous-phase FSK',14,ink);
      }
      case 'msk':{
        const d=[1,-1,1,1,-1,1,-1,-1,-1,1];let x=0,pts=[[60,190]];
        for(let i=0;i<d.length;i++){x+=d[i];pts.push([60+(i+1)*54,190-x*42]);}
        let b=L(50,190,620,190,gray)+L(60,25,60,235,gray);for(let i=0;i<d.length;i++)b+=T(87+i*54,236,d[i]>0?'+':'−',12,gray);
        return b+pathOf(pts,blue,3)+T(464,35,'Δφ = ±π/2 each Tₛ',14,ink);
      }
      case 'fir':{
        let b=T(65,78,'dₙ',16)+arrow(80,72,135,72)+R(138,43,83,55,'#edf4fb')+T(180,76,'z⁻¹',20)+arrow(224,71,264,71)+R(266,43,83,55,'#edf4fb')+T(308,76,'z⁻¹',20)+arrow(352,71,406,71)+R(410,47,90,50,'#edf4fb')+T(456,78,'Σ',20);
        for(let [x,l] of [[105,'h₀'],[245,'h₁'],[374,'h₂']]){b+=L(x,96,x,165,green)+T(x+12,145,l,14,green)+L(x,165,456,165,green);}
        return b+T(338,229,'Tapped delay-line · channel memory D = 2 (illustrative)',14,gray);
      }
      case 'viterbi':{
        const states=['−−','−+','+−','++'];let b='';
        for(let j=0;j<3;j++){b+=T(120+j*220,25,`time ${j}`,13,gray);for(let s=0;s<4;s++)b+=g(120+j*220,57+s*51,13,'#fff',ink,1.7)+T(120+j*220,61+s*51,String(s),12);}
        for(let j=0;j<2;j++){for(let s=0;s<4;s++){let old1=states[s][0];for(const d of ['−','+']){let target=states.findIndex(q=>q[0]===d&&q[1]===old1);b+=L(135+j*220,57+s*51,325+j*220,57+target*51,d==='+'?blue:orange,1.1);}}}
        return b+T(343,250,'4 states, BPSK memory D = 2 · blue +1 / amber −1',13,gray);
      }
      case 'ofdm':{
        let b=L(50,206,630,206,gray)+L(52,24,52,215,gray);
        const sinc=x=>Math.abs(x)<1e-8?1:Math.sin(Math.PI*x)/(Math.PI*x);
        for(let m=0;m<5;m++){const center=135+m*100,pts=[];for(let x=65;x<=620;x+=3){const z=(x-center)/100;pts.push([x,206-130*sinc(z)**2]);}b+=pathOf(pts,[blue,green,orange,purple,gray][m],1.9)+dot(center,76,[blue,green,orange,purple,gray][m],3);}
        return b+T(338,246,'Each sinc² null coincides with neighbouring subcarrier centres',12,gray);
      }
      case 'numerology':{
        let b=T(340,28,'Δfᵤ = 15 · 2ᵘ kHz; Tᵤ = 1 / Δfᵤ',17,ink);
        for(let m=0;m<5;m++){let x=95+m*112,h=145/(2**m);b+=R(x,195-h,75,h,'#edf4fb',blue,3)+T(x+38,216,`μ=${m}`,13)+T(x+38,195-h-9,`${15*2**m} kHz`,12,green);}
        return b+T(339,251,'Higher μ → wider spacing, shorter symbol (scaled bar height)',12,gray);
      }
      case 'cp':{
        let b=T(80,49,'last D',14,ink)+T(380,49,'N useful OFDM samples',14,ink);
        b+=R(70,86,116,92,'#eaf7ef',green,0)+R(186,86,409,92,'#edf4fb',blue,0);
        for(let i=0;i<16;i++){let x=186+i*25.5;b+=L(x,86,x,178,light,1);}
        b+=P('M490 182 Q530 215 575 190 Q605 169 590 146',green,2)+T(136,136,'CP',20,green)+T(388,135,'useful symbol',20,blue)+T(340,244,'CP copies last D samples; remove before FFT',13,gray);
        return b;
      }
      case 'cdma':{
        let b='';const chips=[1,-1,-1,1,1,1,-1],dy=19;
        for(let i=0;i<chips.length;i++){const x=120+i*65,h=chips[i]===1?50:-50;b+=R(x,130-Math.max(0,h),55,Math.abs(h),'#edf4fb',blue,3)+T(x+26,200,chips[i]===1?'+1':'−1',13);}
        return b+T(340,28,'One BPSK bit × 7-chip spreading sequence',16,ink)+L(100,130,625,130,gray)+T(340,244,'Receiver multiplies the same code and sums all chips',13,gray);
      }
      case 'baseband':return plot(x=>x<1.3?1:x<2.3?-1:x<3.7?1:-1,{minX:0,maxX:5,minY:-1.5,maxY:1.5,labelX:'t / Tₛ',labelY:'s(t)'});
      case 'differential':{
        let b=T(75,58,'bits',15)+arrow(105,52,145,52)+R(145,23,140,58,'#edf4fb')+T(215,55,'phase Δφ',17)+arrow(288,52,330,52)+R(330,23,140,58,'#eaf7ef',green)+T(400,55,'accumulate',17)+arrow(473,52,548,52)+T(584,58,'s(t)',15);
        b+=R(250,150,160,50,'#edf4fb')+T(330,180,'Δφ = φₙ − φₙ₋₁',18)+T(337,242,'No absolute carrier phase reference needed',13,gray);return b;
      }
      case 'perunit':{
        let b=T(332,25,'Consistent three-phase bases',17,ink);
        for(const [x,t] of [[72,'Sᵦ'],[254,'Uᵦ'],[448,'Zᵦ=Uᵦ²/Sᵦ']])b+=R(x,78,x>400?170:112,70,'#edf4fb')+T(x+(x>400?85:56),118,t,18);
        b+=arrow(190,110,245,110)+arrow(366,110,443,110)+T(330,212,'Zₚᵤ = Z / Zᵦ; Iᵦ = Sᵦ / (√3 Uᵦ)',17,green)+T(335,244,'Use matching line/phase and three-phase conventions',12,gray);return b;
      }
      case 'powertriangle':{
        let b=P('M190 208 L514 208 L514 58 Z',blue,2.6)+g(190,208,3,blue,blue)+T(348,231,'P (W)',16)+T(543,133,'Q (var)',16)+T(323,102,'S (VA)',16)+T(225,194,'φ',15,green)+T(360,37,'|S|² = P² + Q²',19,ink);return b;
      }
      case 'transformer':{
        let b=L(70,150,205,150,ink)+g(223,150,26,'none',blue)+g(260,150,26,'none',blue)+L(286,150,568,150,ink)+T(330,125,'tap = |a|∠δ',18,ink)+T(154,129,'Uᵢ',15)+T(483,130,'Uⱼ',15);
        b+=L(390,237,390,32,light)+L(295,150,515,150,light)+arrow(391,143,483,143,green)+arrow(391,143,463,103,orange)+T(462,92,`δ = ${k}°`,13,orange)+T(338,252,'Schematic only · transformer orientation is conventional',12,gray);return b;
      }
      case 'bus':{
        const nodes=[[136,75,'Slack'],[355,47,'PV'],[544,124,'PQ'],[385,207,'PQ'],[175,194,'PQ']];let b='';
        for(const [u,v] of [[0,1],[1,2],[2,3],[3,4],[4,0],[1,3]])b+=L(...nodes[u].slice(0,2),...nodes[v].slice(0,2),gray,2.2);
        nodes.forEach(([x,y,t],i)=>{b+=g(x,y,23,'#edf4fb',i===0?green:blue,2)+T(x,y+5,String(i+1),16)+T(x,y-34,t,13,i===0?green:ink);});
        return b+T(336,248,'Illustrative bus layout — not the original seven-node topology',12,gray);
      }
      case 'newton':{
        let b='';
        const items=[['xₖ (voltages)',80],['mismatch Δz',236],['Jacobian J(xₖ)',402],['solve Δx',554]];
        items.forEach(([t,x],i)=>{b+=R(x-56,73,124,70,i%2?'#eaf7ef':'#edf4fb',i%2?green:blue)+T(x+6,114,t,15);if(i<3)b+=arrow(x+70,109,items[i+1][1]-60,109);});
        return b+P('M569 151 L569 214 L86 214 L86 149',orange,2)+T(340,235,'xₖ₊₁ = xₖ + Δx · iterate to tolerance',14,ink);
      }
      case 'dispatch':{
        let b=plot(x=>.13*x+.12,{minX:0,maxX:6,minY:0,maxY:1.5,labelX:'Pᵢ',labelY:'marginal €/MWh'});b+=pathOf(Array.from({length:61},(_,j)=>{const x=65+j*9,y=216-(.20*(j/10)+.03)*183/1.5;return [x,y]}),green,2)+T(428,49,'λ₁(P₁) = λ₂(P₂)',16,ink);return b;
      }
      case 'fault':{
        let b=L(340,132,570,132,gray)+L(340,132,340,21,gray);
        for(const [ang,c,t] of [[0,blue,'Iₐ'],[-120,green,'Iᵦ'],[120,orange,'I𝒸']]){const tRad=ang*Math.PI/180;let x=340+100*Math.cos(tRad),y=132-100*Math.sin(tRad);b+=arrow(340,132,x,y,c)+T(x+(x>340?18:-18),y+(y>132?14:-7),t,15,c);}
        return b+T(342,239,'Balanced 120° phasors · unbalanced faults require sequence networks',13,gray);
      }
      case 'sequence':{
        let b='';
        for(let i=0;i<3;i++){const x=60+205*i;b+=R(x,61,165,123,'#edf4fb')+T(x+82,91,['Positive sequence','Negative sequence','Zero sequence'][i],14)+g(x+50,132,13,'none',blue,1.8)+R(x+97,118,38,30,'#fff')+T(x+115,138,'Z'+[1,2,0][i],14);b+=L(x+63,132,x+97,132,ink);}
        return b+T(340,231,'Fault boundary conditions determine how sequence networks connect',13,gray);
      }
      case 'wls':{
        let b='';
        for(const [x,label] of [[97,'measured z'],[270,'residual z−h(x)'],[470,'weighted JᵀWJ']])b+=R(x-75,77,150,76,'#edf4fb')+T(x,114,label,15);
        b+=arrow(177,115,191,115)+arrow(357,115,387,115)+T(341,38,'minimize Σᵢ wᵢ [zᵢ−hᵢ(x)]²',18,ink)+P('M469 158 L469 212 L97 212 L97 158',orange,2)+T(345,236,'Iterate estimated state x',13,gray);return b;
      }
      case 'statespace':{
        let b=R(220,54,222,108,'#edf4fb')+T(333,84,'ẋ = Ax + Bu',21)+T(333,113,'y = Cx + Du',19)+T(86,113,'u',17)+T(580,113,'y',17)+arrow(104,110,217,110)+arrow(445,110,567,110);
        b+=P('M333 164 L333 222 L220 222 L220 128',green,2)+T(420,213,'state feedback / memory',13,green);return b;
      }
      case 'eigen':{
        let b=L(70,125,613,125,gray)+L(340,24,340,220,gray)+T(614,143,'Re(λ)',13,gray)+T(352,22,'Im(λ)',13,gray);
        b+=R(73,35,265,183,'#eaf7ef',green,0);
        for(const [x,y,c] of [[215,67,green],[270,145,green],[432,95,orange],[480,157,orange]]){b+=L(x-8,y-8,x+8,y+8,c,2.8)+L(x-8,y+8,x+8,y-8,c,2.8);}
        return b+T(202,234,'Re(λ) < 0 stable',13,green)+T(474,234,'Re(λ) > 0 unstable',13,orange);
      }
      case 'superposition':{
        let b='';
        for(const [y,name,color] of [[40,'u₁',blue],[117,'u₂',green]]){b+=T(82,y+21,name,16,color)+R(125,y,155,51,'#edf4fb')+T(201,y+30,'LTI system G',17)+arrow(281,y+25,348,y+25,color)+T(373,y+30,name.replace('u','y'),16,color);}
        b+=T(350,235,'G{u₁ + u₂} = G{u₁} + G{u₂}',18,ink);return b;
      }
      case 'transfer':{
        let b=T(90,132,'u(s)',18)+arrow(120,125,216,125)+R(215,77,235,96,'#edf4fb')+T(334,120,'G(s) = C(sI−A)⁻¹B + D',17)+arrow(454,125,543,125)+T(565,131,'y(s)',18);
        return b+T(340,243,'Poles are eigenvalues of A in a minimal realization',13,gray);
      }
      case 'pendulum':{
        const angle=Math.PI/5+Math.sin(a)*.35,pivot=[350,44],len=137,x=pivot[0]+len*Math.sin(angle),y=pivot[1]+len*Math.cos(angle);
        let b=L(180,40,515,40,ink,4)+L(pivot[0],45,pivot[0],212,light,2,'6 5')+L(pivot[0],45,x,y,blue,5)+g(x,y,21,'#edf4fb',blue,3)+g(...pivot,8,ink,ink)+P(`M350 91 Q390 89 ${350+50*Math.sin(angle)} ${44+50*Math.cos(angle)}`,orange,2)+T(399,103,'θ',17,orange);
        return b+T(340,239,'mℓ² θ̈ + b θ̇ + mgℓ sinθ = u',17,ink);
      }
      case 'jordan':{
        let b=R(207,42,267,153,'#edf4fb')+T(338,71,'J =',20)+T(357,94,'λ   1   0',22)+T(357,129,'0   λ   1',22)+T(357,164,'0   0   λ',22)+T(338,233,'A repeated eigenvalue may have a Jordan chain',14,gray);return b;
      }
      case 'controllability':{
        let b=T(339,38,'𝒞 = [ B  AB  A²B  …  Aⁿ⁻¹B ]',24,ink);
        for(let i=0;i<4;i++){b+=R(105+i*122,88,91,90,i===0?'#eaf7ef':'#edf4fb',i===0?green:blue)+T(151+i*122,132,['B','AB','A²B','A³B'][i],18);}
        return b+T(340,225,'Full row rank n  ⇒  completely controllable',15,green);
      }
      case 'feedback':{
        let b=T(73,102,'r',17)+arrow(90,97,145,97)+g(159,97,15,'#fff',ink)+T(159,102,'Σ',15)+arrow(175,97,230,97)+R(230,62,169,68,'#edf4fb')+T(314,102,'Plant (A,B,C)',16)+arrow(400,97,539,97)+T(564,103,'y',16);
        b+=P('M475 97 L475 208 L321 208',green,2)+R(253,181,67,55,'#eaf7ef',green)+T(286,213,'−Kx',16,green)+P('M253 208 L159 208 L159 114',green,2);
        return b+T(338,251,'Closed-loop poles: eig(A−BK)',13,gray);
      }
      case 'chain':{
        let b=T(74,70,'Pᵢₙ',15);
        for(const [x,name,val] of [[143,'Amp','+20 dB'],[312,'Cable','−24 dB'],[480,'Filter','−3 dB']]){b+=R(x,94,124,78,'#edf4fb')+T(x+62,123,name,16)+T(x+62,148,val,13,green);}
        for(const [x1,x2] of [[84,140],[269,309],[438,477],[607,650]])b+=arrow(x1,130,x2,130);
        return b+T(339,46,'P_out(dBm) = P_in(dBm) + Σ gains − Σ losses',17,ink)+T(345,232,'Schematic gain values are illustrative; refer to exact exercise data',12,gray);
      }
      case 'coax':{
        let b=g(340,126,111,'#e5edf4',ink,3)+g(340,126,56,'#fff',ink,3)+g(340,126,19,ink,ink,1);
        for(let i=0;i<8;i++){let aa=i*Math.PI/4,x1=340+37*Math.cos(aa),y1=126+37*Math.sin(aa),x2=340+104*Math.cos(aa),y2=126+104*Math.sin(aa);b+=L(x1,y1,x2,y2,blue,1.8)+dot(x2,y2,blue,2);}
        return b+T(340,22,'E ∝ 1 / (r ln(b/a))',17,ink)+T(340,253,'E field radial; H field circumferential (TEM)',13,gray);
      }
      case 'transmission':{
        const gamma=eff*.8;let b=L(55,135,635,135,light,2);
        let pts=[];for(let n=0;n<=400;n++){let xx=n/400*540,t=xx/34;let y=135-36*Math.cos(t)-36*gamma*Math.cos(-t+1.0);pts.push([80+xx,y]);}
        return b+pathOf(pts,blue,2.6)+T(342,38,'V(z) = V⁺e⁻ʲᵝᶻ + ΓV⁺e⁺ʲᵝᶻ',18,ink)+T(338,236,'Standing-wave envelope changes with reflection coefficient',13,gray);
      }
      case 'smith':{
        let b=g(340,125,100,'#fff',ink,2.3)+L(240,125,440,125,gray)+L(340,25,340,225,light);
        for(let r of [25,50,75])b+=g(340+r/3,125,r/2,'none',light,1);
        const radius=Math.min(.85,.18+eff*.7)*100,x=340+radius*Math.cos(a*2),y=125-radius*Math.sin(a*2);
        b+=g(340,125,radius,'none',orange,1.4)+dot(x,y,blue,7)+L(340,125,x,y,blue,2)+T(x+17,y-13,'Γ',15,blue);
        return b+T(338,245,'Normalized z = Z / Z₀ · Γ = (z−1)/(z+1)',13,gray);
      }
      case 'twoport':{
        let b=R(221,68,223,111,'#edf4fb')+T(334,117,'[ S₁₁  S₁₂ ]',19)+T(334,147,'[ S₂₁  S₂₂ ]',19)+arrow(80,101,218,101,blue)+arrow(449,101,580,101,blue)+arrow(219,147,82,147,orange)+arrow(579,147,447,147,orange);
        return b+T(116,90,'a₁',15)+T(116,167,'b₁',15)+T(548,90,'b₂',15)+T(548,168,'a₂',15)+T(342,241,'b = S a · arrows denote incident and reflected waves',13,gray);
      }
      case 'noisechain':{
        let b='';
        for(const [i,x,name] of [[0,95,'Line'],[1,265,'LNA'],[2,435,'Filter']]){b+=R(x,81,145,85,'#edf4fb')+T(x+72,114,name,18)+T(x+72,142,['loss L','gain G / NF','insertion loss'][i],14,gray);if(i<2)b+=arrow(x+148,123,x+166,123);}
        return b+T(338,43,'Friis: F_total = F₁+(F₂−1)/G₁+…',17,ink)+T(337,240,'Noise is referred to an input; early stages dominate',13,gray);
      }
      case 'coupler':{
        let b=R(231,60,210,130,'#edf4fb')+T(336,119,'3-dB hybrid',22)+T(336,143,'4-port coupler',16);
        for(const [x1,y1,x2,y2,label] of [[102,92,228,92,'IN'],[444,92,575,92,'THRU'],[102,158,228,158,'ISO'],[444,158,575,158,'COUPLED']]){b+=L(x1,y1,x2,y2,blue,2)+T(x1<x2?x2+2:x1,y1-15,label,12,ink);}
        return b+T(340,239,'Ideal: matched, isolated, equal power split where specified',13,gray);
      }
      case 'bridge':{
        let b=g(100,125,6,ink,ink)+L(106,125,160,125,ink)+L(160,65,160,185,ink)+L(160,65,225,65,blue)+L(160,185,225,185,blue);
        b+=R(225,35,185,60,'#edf4fb')+R(225,155,185,60,'#edf4fb')+T(320,72,'Amplifier A₁',17)+T(320,192,'Amplifier A₂',17);
        b+=L(413,65,492,65,green)+L(413,185,492,185,green)+L(492,65,492,185,ink)+L(492,125,584,125,ink)+T(337,248,'Parallel paths re-combined; phase balance matters',13,gray);return b;
      }
      case 'waveguide':{
        let b=R(167,42,346,169,'#edf4fb',blue,1);
        const pts=[];for(let j=0;j<=120;j++){let x=168+j*344/120,y=128-56*Math.sin(Math.PI*j/120);pts.push([x,y]);}
        b+=pathOf(pts,green,3)+T(339,37,'TE₁₀: one half-wave across broad wall a',16,ink)+T(340,227,'a',17)+L(168,218,512,218,gray)+T(340,249,'f_c = c / (2a√εᵣ)',15,gray);return b;
      }
      case 'cap':{
        const gap=44+eff*90;let b=R(160,72,358,19,'#dce7f0',ink,0)+R(160,91+gap,358,19,'#dce7f0',ink,0);
        for(let i=0;i<8;i++){const x=188+i*42;b+=L(x,96,x,87+gap,blue,1.7)+P(`M${x-4} ${gap+83} L${x} ${gap+89} L${x+4} ${gap+83}`,blue,1.5);}
        return b+T(340,41,'C = εA / d',21,ink)+T(561,118,`d (scaled)`,13,gray)+T(340,251,'Changing the gap changes capacitance and sensor sensitivity',13,gray);
      }
      case 'etch':{
        const depth=30+eff*95;let b=R(111,85,455,125,'#edf4fb',ink,0);
        b+=R(210,83,255,9,'#bccedc',ink,0)+R(278,85,125,depth,'#fff',blue,0)+T(341,73,'mask opening',14,gray)+T(340,235,'Etch depth d ≈ rate × time (ideal rate model)',15,ink);return b;
      }
      case 'spring':{
        let b=L(95,35,575,35,ink,4);
        let z=45,pts=[[340,z]];for(let n=0;n<12;n++){pts.push([n%2?375:306,55+n*7]);}pts.push([340,144]);
        b+=pathOf(pts,blue,3)+R(267,144,146,61,'#edf4fb',ink,4)+T(340,181,'mass m',18)+arrow(431,167,431,226,orange)+T(483,214,'a',15,orange)+T(340,246,'f₀ = (1/2π)√(k/m);  x = ma/k at low frequency',12,gray);return b;
      }
      case 'gauge':{
        let b=R(178,88,314,73,'#edf4fb')+P('M191 122 L230 122 L246 105 L261 139 L277 105 L292 139 L307 105 L322 139 L337 105 L353 139 L369 105 L386 122 L474 122',orange,2.3)+arrow(122,123,171,123,green)+arrow(496,123,554,123,green);
        return b+T(339,46,'ΔR/R = GF · ε',20,ink)+T(341,231,'Strain stretches/shortens the resistor track',14,gray);
      }
      case 'thermal':{
        let b=R(95,112,425,30,'#edf4fb',blue,0)+L(95,108,95,165,gray)+L(520,108,520,165,gray)+R(95,163,500,28,'#eaf7ef',green,0);
        return b+T(341,42,'ΔL = α L₀ ΔT',22,ink)+T(354,91,'L₀',14,blue)+T(354,222,'L₀ + ΔL (illustrative expansion)',14,green);
      }
      case 'diffusion':{
        const s=.3+eff*.8;return plot(x=>Math.exp(-((x-3)**2)/(2*s*s)),{minX:0,maxX:6,minY:0,maxY:1.15,labelX:'position x',labelY:'C/C₀'})+T(461,44,'width ∝ √(D t)',14,ink);
      }
      case 'cantilever':{
        let b=R(95,72,35,163,'#dce7f0',ink,0);
        const bend=.00000035+(eff*.0000003),pts=[];for(let i=0;i<=100;i++){const x=130+i*4.8,y=115+90*(i/100)**2;pts.push([x,y]);}
        b+=pathOf(pts,blue,6)+arrow(612,170,612,219,orange)+T(621,203,'F',15,orange)+T(339,51,'δ_tip = F L³ / (3 E I)',19,ink)+T(348,247,'Cantilever under an end load (shape illustrative)',13,gray);return b;
      }
      default:return R(200,65,280,130,'#edf4fb')+T(340,145,'Engineering concept schematic',17);
    }
  }
  function renderVisual(ex,current){
    const kind=visualKindFor(ex),[title,description]=names[kind]||names.baseband;
    const slider=range(kind),value=Number.isFinite(Number(current))?Number(current):slider?.value??40;
    const actual=Number(value);
    const visual=frame(title,description,drawing(kind,actual));
    const isSourceOnly=!Array.isArray(ex?.parts)||ex.parts.length===0;
    return `<section class="eeit-viz-panel" data-visual-exercise="${E(ex?.id||'')}" data-visual-kind="${E(kind)}" aria-labelledby="eeit-viz-title">
      <div class="eeit-viz-header"><div><div class="eeit-viz-kicker">Engineering visual lab · ${E(ex?.subject||'course')}</div><h3 id="eeit-viz-title">${E(title)}</h3><p>${E(description)}</p></div><span class="eeit-viz-tag">Original SVG</span></div>
      <div class="eeit-viz-graphic">${visual}</div>
      ${slider?`<label class="eeit-viz-control"><span>${E(slider.label)}</span><strong class="eeit-viz-value">${actual}${kind==='rotation'||kind==='pendulum'||kind==='transformer'?'°':'%'}</strong><input type="range" data-action="visual-slider" data-id="${E(ex?.id||'')}" min="${slider.min}" max="${slider.max}" step="${slider.step}" value="${actual}" aria-label="${E(slider.label)}"></label>`:''}
      <p class="eeit-viz-note">${isSourceOnly?'Reference-only exercise: exact source question/derivation is not yet verified. This is a generic teaching diagram.':'Instructional schematic / illustrative parameter explorer — not an official question figure, a measured graph, or independent proof of the calculation.'}</p>
    </section>`;
  }
  return {renderVisual,visualKindFor,visualTypes:Object.freeze([...new Set(map.values())]),visualMappedIds:Object.freeze([...map.keys()])};
});
export const {renderVisual, visualKindFor, visualTypes, visualMappedIds} = createVisualEngine();
