'use strict';
// Numerical regression against independently computed engineering quantities.
// These checks validate selected examples; they DO NOT certify all 5 subjects or the official examinations.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'../source/data');
const read=n=>JSON.parse(fs.readFileSync(path.join(root,n),'utf8'));
const orig=read('original-practice-reworked.json');
const src=read('source-backed-derivations.json');
const byId=new Map([...orig.overrides,...src.overrides].map(x=>[x.id,x]));
function approx(a,b,tol,label){assert(Number.isFinite(a),label+' is not finite');assert(Math.abs(a-b)<=tol,label+': '+a+' != '+b);}
function part(id,label){const x=byId.get(id);assert(x,id+' missing');const p=x.parts.find(p=>p.label===label);assert(p,id+'/'+label+' missing');return p;}
function equationContains(id,label,term){const p=part(id,label);const whole=(p.working||[]).map(x=>x.value).concat(p.finalAnswer||'').join('\n');assert(whole.includes(term),id+'/'+label+' should show '+term);}
const sqrt=Math.sqrt, log10=Math.log10, PI=Math.PI;
const zbase=(110e3)**2/100e6, ibase=100e6/(sqrt(3)*110e3), copper=(.8)**2*.1*100;
approx(zbase,121,1e-10,'EPS base impedance');
approx(ibase,524.8638811,0.00001,'EPS current base');
approx(copper,6.4,1e-10,'EPS copper loss MW');
equationContains('original-p1','a','121');
equationContains('practice-eps-per-unit','c','6.4 MW');
const S=sqrt(3)*400*20, P=S*.8, Q=S*.6;
approx(S,13856.40646055,.00001,'EPS apparent VA');
approx(P/1000,11.08512517,.00001,'EPS real kW');
approx(Q/1000,8.31384388,.00001,'EPS reactive kVAr');
const A=[[0,1],[-2,-3]], B=[0,1];
const AB=[A[0][0]*B[0]+A[0][1]*B[1],A[1][0]*B[0]+A[1][1]*B[1]];
approx(B[0]*AB[1]-B[1]*AB[0],-1,1e-12,'Control Kalman determinant');
const K=[18,6];const Acl=[[0,1],[-2-K[0],-3-K[1]]];
approx(Acl[1][1],-9,1e-12,'Control closed-loop trace');
approx(-Acl[1][0],20,1e-12,'Control closed-loop determinant');
equationContains('original-c4','c','k1=18');
const Rb=100e3, alpha=.25, ebno=10**(.6);
approx(1/Rb*1e6,10,1e-12,'BPSK bit duration us');
approx((1+alpha)*Rb/1000,125,1e-12,'BPSK RF bandwidth kHz');
const erfcApprox=x=>{
 const z=Math.abs(x), t=1/(1+.3275911*z);
 const erf=1-((((((1.061405429*t-1.453152027)*t)+1.421413741)*t)-.284496736)*t+.254829592)*t*Math.exp(-z*z);
 return x>=0?1-erf:1+erf;
};
approx(.5*erfcApprox(sqrt(ebno)),0.00238829,.000001,'BPSK AWGN BER');
equationContains('practice-dc-bpsk','b','125');
const gamma=(100-50)/(100+50);
approx(gamma,1/3,1e-15,'MW reflection coefficient');
approx((1+gamma)/(1-gamma),2,1e-15,'MW VSWR');
approx(-20*log10(gamma),9.542425094,1e-6,'MW return loss dB');
const er=2.3,f=5e9,z=1.5+0.2; // z is for display only; use complex arithmetic below.
const discriminant=.4*.4+4*.79*.5;
const tanTheta=(.4-sqrt(discriminant))/(2*.79);
const theta=Math.atan(tanTheta)+PI;
const lambda=3e8/(f*sqrt(er));
const length=theta/(2*PI)*lambda;
approx(length*1000,16.46399539,.00001,'Original MW matching line mm');
const t=tanTheta;
const a=1.5,b=.2;
const dReal=1-b*t,dImag=a*t;
const nReal=a, nImag=b+t;
const zinReal=(nReal*dReal+nImag*dImag)/(dReal*dReal+dImag*dImag);
const zinImag=(nImag*dReal-nReal*dImag)/(dReal*dReal+dImag*dImag);
approx(zinReal,1,1e-12,'MW normalized transformed R');
const X=zinImag*50,cap=1/(2*PI*f*X);
approx(X,21.9848432638,1e-8,'MW transformed reactance Ω');
approx(cap*1e12,1.44786061,.0000001,'MW matching capacitor pF');
equationContains('official-mw-2-5','b','16.464');
equationContains('official-mw-2-5','c','1.448 pF');
const eps0=8.854e-12,area=1e-6,gap=2e-6,volt=5;
approx(eps0*area/gap*1e12,4.427,1e-12,'MEMS capacitance pF');
approx(-eps0*area/(gap*gap)*1e6,-2.2135,1e-12,'MEMS sensitivity pF/um');
approx(eps0*area*volt**2/(2*gap**2)*1e6,27.66875,1e-8,'MEMS electrostatic force μN');
equationContains('practice-micro-cap','c','27.66875');
const E=160e9,beamWidth=100e-6,beamThickness=10e-6,beamLength=1e-3,force=10e-6;
const I=beamWidth*beamThickness**3/12;
approx(force*beamLength**3/(3*E*I)*1e6,2.5,1e-10,'MEMS cantilever displacement μm');
approx(6*force*beamLength/(beamWidth*beamThickness**2)/1e6,6,1e-10,'MEMS root stress MPa');
console.log('PASS cross-subject numeric regression: DC, EPS II, Control, Microwave, Microsystem. This test covers selected problems, not the entire exam syllabus.');
