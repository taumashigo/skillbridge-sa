/**
 * SkillBridge SA — Expanded Test Suite (60+ tests)
 * Run: npx vitest run
 */
import { describe, it, expect } from "vitest";

// ── Helpers ──────────────────────────────────────────────

function validateProfile(d) {
  const e = [];
  if (!d.name || d.name.length < 2) e.push({ field: "name", issue: "min_length" });
  if (!d.email || !d.email.includes("@")) e.push({ field: "email", issue: "invalid_email" });
  if (d.yearsExperience != null && (d.yearsExperience < 0 || d.yearsExperience > 50)) e.push({ field: "yearsExperience", issue: "range" });
  if (d.hoursPerWeek != null && (d.hoursPerWeek < 1 || d.hoursPerWeek > 80)) e.push({ field: "hoursPerWeek", issue: "range" });
  if (d.bandwidth && !["low","medium","high"].includes(d.bandwidth)) e.push({ field: "bandwidth", issue: "invalid" });
  return { valid: e.length === 0, errors: e };
}

function validateJobInput(d) {
  const e = [];
  if (!d.title || d.title.length < 3) e.push({ field: "title", issue: "min_length" });
  if (!d.description && !d.url) e.push({ field: "description", issue: "required" });
  if (d.url && !d.url.startsWith("http")) e.push({ field: "url", issue: "invalid" });
  if (d.proficiency && !["beginner","intermediate","advanced"].includes(d.proficiency)) e.push({ field: "proficiency", issue: "invalid" });
  if (d.timeline && !["2_weeks","1_month","3_months"].includes(d.timeline)) e.push({ field: "timeline", issue: "invalid" });
  return { valid: e.length === 0, errors: e };
}

function validateCvUpload(f) {
  const ok = ["application/pdf","application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
  const e = [];
  if (!f) e.push({ field: "file", issue: "required" });
  else { if (!ok.includes(f.type)) e.push({ field: "file", issue: "type" }); if (f.size > 10485760) e.push({ field: "file", issue: "size" }); if (f.size === 0) e.push({ field: "file", issue: "empty" }); }
  return { valid: e.length === 0, errors: e };
}

function validateRedirect(d) {
  const e = [];
  if (!d.redirectText || d.redirectText.length < 3) e.push({ field: "redirectText", issue: "min" });
  if (d.redirectText && d.redirectText.length > 500) e.push({ field: "redirectText", issue: "max" });
  return { valid: e.length === 0, errors: e };
}

const PATTERNS = [
  { p: /\bpython\b/gi, s: "Python", c: "lang" },{ p: /\bsql\b/gi, s: "SQL", c: "lang" },
  { p: /\b(machine learning|ML)\b/gi, s: "Machine Learning", c: "ai" },{ p: /\b(aws|amazon web services)\b/gi, s: "AWS", c: "cloud" },
  { p: /\btableau\b/gi, s: "Tableau", c: "viz" },{ p: /\b(power bi|powerbi)\b/gi, s: "Power BI", c: "viz" },
  { p: /\bdocker\b/gi, s: "Docker", c: "devops" },{ p: /\b(agile|scrum|sprint)\b/gi, s: "Agile", c: "process" },
  { p: /\breact\b/gi, s: "React", c: "fw" },{ p: /\bnode\.?js\b/gi, s: "Node.js", c: "fw" },
  { p: /\bpostgres(ql)?\b/gi, s: "PostgreSQL", c: "db" },{ p: /\btypescript\b/gi, s: "TypeScript", c: "lang" },
];
function extractSkills(t) { const f = new Map(); for (const {p,s,c} of PATTERNS) { p.lastIndex=0; const m=t.match(new RegExp(p.source,p.flags)); if (m) f.set(s,{skill:s,category:c,mentions:m.length}); } return [...f.values()].sort((a,b)=>b.mentions-a.mentions); }
function matchScore(cv,job) { if (!job.length) return {score:0,overlaps:[],gaps:[]}; const s=new Set(cv.map(x=>x.toLowerCase())); const o=job.filter(x=>s.has(x.toLowerCase())),g=job.filter(x=>!s.has(x.toLowerCase())); return {score:Math.round(o.length/job.length*100),overlaps:o,gaps:g}; }
function scoreAssessment(ans,key) { let c=0; const r=[]; for (const[q,a] of Object.entries(key)){const ok=ans[q]===a;if(ok)c++;r.push({q,ok})} const t=Object.keys(key).length; return {score:t?Math.round(c/t*100):0,correct:c,total:t,results:r}; }
function prioritiseGaps(gaps,tl) { const tw={"2_weeks":3,"1_month":2,"3_months":1}[tl]||1; return gaps.map(g=>({...g,pri:g.impact*g.deficiency*tw,label:g.impact*g.deficiency*tw>15?"High":g.impact*g.deficiency*tw>8?"Medium":"Low"})).sort((a,b)=>b.pri-a.pri); }
function apiResponse(d,e=null,rid="req_t") { return {success:!e,data:e?null:d,error:e?{code:e.code,message:e.message}:null,requestId:rid,timestamp:new Date().toISOString()}; }
function createRL() { const s=new Map(); return (k,m=5,w=60000)=>{const n=Date.now();const r=s.get(k)||{count:0,reset:n+w};if(n>r.reset){r.count=0;r.reset=n+w}r.count++;s.set(k,r);return r.count<=m?{allowed:true}:{allowed:false,retryAfter:Math.ceil((r.reset-n)/1000)}}; }
function cleanText(t) { return t.replace(/\r\n/g,"\n").replace(/\r/g,"\n").replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g,"").replace(/\n{3,}/g,"\n\n").replace(/[ \t]{2,}/g," ").trim(); }
function extractHTML(h) { return h.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi," ").replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/\s+/g," ").trim(); }
function exportTranscript(title,turns) { const l=[`# ${title}\n---\n`];let ch=null;for(const t of turns){if(t.chapter&&t.chapter!==ch){ch=t.chapter;l.push(`\n## ${ch}\n`)}l.push(`**${t.name}:**${t.isRedirect?" [Redirect]":""} ${t.content}\n`)}return l.join("\n"); }
function weeklyPlan(gaps,hrs,tl) { const w={"2_weeks":2,"1_month":4,"3_months":12}[tl]||4;const s=[...gaps].sort((a,b)=>(b.impact||3)*(b.deficiency||3)-(a.impact||3)*(a.deficiency||3));return Array.from({length:w},(_,i)=>({week:i+1,focus:s[i%s.length]?.skill||"Review",hours:hrs})); }
function checkConsent(u,a) { if(a==="cv_analysis"&&!u.consentCv) return{allowed:false,reason:"Consent required"};if(a==="analytics"&&!u.consentAnalytics) return{allowed:false};return{allowed:true}; }
function estimateCost(i,o) { return{input:(i/1e6)*3,output:(o/1e6)*15,total:(i/1e6)*3+(o/1e6)*15}; }

// ── TESTS ────────────────────────────────────────────────

describe("Profile Validation", ()=>{
  it("accepts valid",()=>expect(validateProfile({name:"Thabo",email:"t@t.com"}).valid).toBe(true));
  it("rejects empty name",()=>expect(validateProfile({name:"",email:"t@t.com"}).valid).toBe(false));
  it("rejects bad email",()=>expect(validateProfile({name:"T",email:"x"}).valid).toBe(false));
  it("rejects negative exp",()=>expect(validateProfile({name:"T",email:"t@t.com",yearsExperience:-1}).valid).toBe(false));
  it("rejects 100h/week",()=>expect(validateProfile({name:"T",email:"t@t.com",hoursPerWeek:100}).valid).toBe(false));
  it("rejects bad bandwidth",()=>expect(validateProfile({name:"T",email:"t@t.com",bandwidth:"ultra"}).valid).toBe(false));
});

describe("Job Input Validation", ()=>{
  it("accepts manual",()=>expect(validateJobInput({title:"Data Analyst",description:"..."}).valid).toBe(true));
  it("accepts URL",()=>expect(validateJobInput({title:"Data Analyst",url:"https://x.com"}).valid).toBe(true));
  it("rejects no desc/url",()=>expect(validateJobInput({title:"Data Analyst"}).valid).toBe(false));
  it("rejects short title",()=>expect(validateJobInput({title:"DA",description:"x"}).valid).toBe(false));
  it("rejects bad url",()=>expect(validateJobInput({title:"Data Analyst",url:"ftp://x"}).valid).toBe(false));
  it("rejects bad proficiency",()=>expect(validateJobInput({title:"Data Analyst",description:"x",proficiency:"expert"}).valid).toBe(false));
  it("rejects bad timeline",()=>expect(validateJobInput({title:"Data Analyst",description:"x",timeline:"6_months"}).valid).toBe(false));
});

describe("CV Upload Validation", ()=>{
  it("accepts PDF",()=>expect(validateCvUpload({type:"application/pdf",size:500000}).valid).toBe(true));
  it("accepts DOCX",()=>expect(validateCvUpload({type:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",size:200000}).valid).toBe(true));
  it("rejects null",()=>expect(validateCvUpload(null).valid).toBe(false));
  it("rejects PNG",()=>expect(validateCvUpload({type:"image/png",size:100}).valid).toBe(false));
  it("rejects >10MB",()=>expect(validateCvUpload({type:"application/pdf",size:15*1024*1024}).valid).toBe(false));
  it("rejects empty",()=>expect(validateCvUpload({type:"application/pdf",size:0}).valid).toBe(false));
});

describe("Redirect Validation", ()=>{
  it("accepts valid",()=>expect(validateRedirect({redirectText:"Explain SQL"}).valid).toBe(true));
  it("rejects empty",()=>expect(validateRedirect({redirectText:""}).valid).toBe(false));
  it("rejects short",()=>expect(validateRedirect({redirectText:"hi"}).valid).toBe(false));
  it("rejects long",()=>expect(validateRedirect({redirectText:"x".repeat(501)}).valid).toBe(false));
});

describe("Skill Extraction",()=>{
  it("finds Python+SQL",()=>{const s=extractSkills("Python developer with SQL");expect(s.some(x=>x.skill==="Python")).toBe(true);expect(s.some(x=>x.skill==="SQL")).toBe(true)});
  it("case insensitive",()=>expect(extractSkills("PYTHON and AWS").some(x=>x.skill==="Python")).toBe(true));
  it("counts mentions",()=>expect(extractSkills("Python Python Python").find(x=>x.skill==="Python").mentions).toBe(3));
  it("empty for irrelevant",()=>expect(extractSkills("barista coffee")).toHaveLength(0));
  it("finds Agile from sprint",()=>expect(extractSkills("2-week sprint cycles").some(x=>x.skill==="Agile")).toBe(true));
  it("finds modern stack",()=>expect(extractSkills("React Node.js TypeScript PostgreSQL").length).toBeGreaterThanOrEqual(4));
  it("finds ML abbreviation",()=>expect(extractSkills("ML models").some(x=>x.skill==="Machine Learning")).toBe(true));
});

describe("Match Score",()=>{
  it("100% perfect",()=>expect(matchScore(["Python","SQL"],["Python","SQL"]).score).toBe(100));
  it("0% no overlap",()=>expect(matchScore(["Java"],["Python","SQL"]).score).toBe(0));
  it("50% partial",()=>expect(matchScore(["Python","SQL"],["Python","SQL","AWS","ML"]).score).toBe(50));
  it("case insensitive",()=>expect(matchScore(["python"],["Python"]).score).toBe(100));
  it("empty job=0",()=>expect(matchScore(["Python"],[]).score).toBe(0));
  it("handles dupes",()=>expect(matchScore(["Python","Python"],["Python"]).score).toBe(100));
});

describe("Assessment Scoring",()=>{
  const k={q1:0,q2:1,q3:1,q4:1,q5:1};
  it("100% all correct",()=>expect(scoreAssessment({q1:0,q2:1,q3:1,q4:1,q5:1},k).score).toBe(100));
  it("0% all wrong",()=>expect(scoreAssessment({q1:3,q2:3,q3:3,q4:3,q5:3},k).score).toBe(0));
  it("40% partial",()=>expect(scoreAssessment({q1:0,q2:1,q3:0,q4:0,q5:0},k).score).toBe(40));
  it("missing answers",()=>expect(scoreAssessment({q1:0},k).correct).toBe(1));
  it("empty=0",()=>expect(scoreAssessment({},{}).score).toBe(0));
});

describe("Gap Prioritisation",()=>{
  const g=[{skill:"ML",impact:5,deficiency:3},{skill:"SQL",impact:4,deficiency:2},{skill:"Docker",impact:2,deficiency:1}];
  it("sorts desc",()=>expect(prioritiseGaps(g,"1_month")[0].skill).toBe("ML"));
  it("shorter=more urgent",()=>expect(prioritiseGaps(g,"2_weeks")[0].pri).toBeGreaterThan(prioritiseGaps(g,"3_months")[0].pri));
  it("labels correctly",()=>{const r=prioritiseGaps(g,"1_month");expect(r[0].label).toBe("High");expect(r[2].label).toBe("Low")});
  it("empty gaps",()=>expect(prioritiseGaps([],"1_month")).toHaveLength(0));
});

describe("API Response",()=>{
  it("success format",()=>{const r=apiResponse({id:"1"});expect(r.success).toBe(true);expect(r.error).toBeNull()});
  it("error format",()=>{const r=apiResponse(null,{code:"ERR",message:"bad"});expect(r.success).toBe(false);expect(r.data).toBeNull()});
  it("has requestId",()=>expect(apiResponse({}).requestId).toBeDefined());
  it("has timestamp",()=>expect(apiResponse({}).timestamp).toBeDefined());
});

describe("Rate Limiter",()=>{
  it("allows within limit",()=>{const rl=createRL();for(let i=0;i<5;i++)expect(rl("u1",5).allowed).toBe(true)});
  it("blocks over limit",()=>{const rl=createRL();for(let i=0;i<5;i++)rl("u2",5);expect(rl("u2",5).allowed).toBe(false)});
  it("independent keys",()=>{const rl=createRL();for(let i=0;i<6;i++)rl("a",5);expect(rl("a",5).allowed).toBe(false);expect(rl("b",5).allowed).toBe(true)});
  it("retry-after",()=>{const rl=createRL();for(let i=0;i<6;i++)rl("u3",5);expect(rl("u3",5).retryAfter).toBeGreaterThan(0)});
});

describe("Text Cleaning",()=>{
  it("normalises CRLF",()=>expect(cleanText("a\r\nb")).toBe("a\nb"));
  it("removes control chars",()=>expect(cleanText("a\x00b")).toBe("ab"));
  it("collapses newlines",()=>expect(cleanText("a\n\n\n\nb")).toBe("a\n\nb"));
  it("collapses spaces",()=>expect(cleanText("a   b")).toBe("a b"));
  it("trims",()=>expect(cleanText("  hi  ")).toBe("hi"));
});

describe("HTML Extraction",()=>{
  it("strips tags",()=>expect(extractHTML("<p>Hello</p>")).toBe("Hello"));
  it("strips scripts",()=>expect(extractHTML("<script>x</script>Hi")).toBe("Hi"));
  it("strips styles",()=>expect(extractHTML("<style>.x{}</style>Hi")).toBe("Hi"));
  it("handles entities",()=>expect(extractHTML("A&amp;B")).toBe("A&B"));
});

describe("Transcript Export",()=>{
  const t=[{name:"T",content:"Hi",chapter:"Intro",isRedirect:false},{name:"You",content:"Q",chapter:"Q&A",isRedirect:true}];
  it("has title",()=>expect(exportTranscript("Ep1",t)).toContain("# Ep1"));
  it("has chapters",()=>{const m=exportTranscript("E",t);expect(m).toContain("## Intro");expect(m).toContain("## Q&A")});
  it("marks redirects",()=>expect(exportTranscript("E",t)).toContain("[Redirect]"));
});

describe("Weekly Plan",()=>{
  const g=[{skill:"ML",impact:5,deficiency:4},{skill:"SQL",impact:4,deficiency:2}];
  it("4 weeks for 1 month",()=>expect(weeklyPlan(g,10,"1_month")).toHaveLength(4));
  it("2 weeks for short",()=>expect(weeklyPlan(g,10,"2_weeks")).toHaveLength(2));
  it("12 weeks for 3 months",()=>expect(weeklyPlan(g,10,"3_months")).toHaveLength(12));
  it("highest gap first",()=>expect(weeklyPlan(g,10,"1_month")[0].focus).toBe("ML"));
  it("cycles gaps",()=>{const p=weeklyPlan(g,10,"1_month");expect(p[1].focus).toBe("SQL");expect(p[2].focus).toBe("ML")});
  it("includes hours",()=>expect(weeklyPlan(g,15,"1_month")[0].hours).toBe(15));
  it("handles empty",()=>expect(weeklyPlan([],10,"1_month")[0].focus).toBe("Review"));
});

describe("POPIA Consent",()=>{
  it("blocks CV without consent",()=>expect(checkConsent({consentCv:false},"cv_analysis").allowed).toBe(false));
  it("allows CV with consent",()=>expect(checkConsent({consentCv:true},"cv_analysis").allowed).toBe(true));
  it("blocks analytics without consent",()=>expect(checkConsent({consentAnalytics:false},"analytics").allowed).toBe(false));
  it("provides reason",()=>expect(checkConsent({consentCv:false},"cv_analysis").reason).toContain("Consent"));
});

describe("Cost Estimation",()=>{
  it("calculates correctly",()=>{const c=estimateCost(1000,500);expect(c.total).toBeCloseTo(0.0105)});
  it("zero tokens=0",()=>expect(estimateCost(0,0).total).toBe(0));
});
