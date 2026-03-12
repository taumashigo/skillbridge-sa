// Mock data — will be replaced by real API data in Phase 2

// ============================================================
// MOCK DATA
// ============================================================
export const COMPS=[
  {name:"Python Programming",cat:"Technical",score:4,max:5,def:"Proficiency in Python for data processing, scripting, and application development.",why:"Core language for the role; used in 85% of day-to-day tasks.",synonyms:["Python 3","Scripting"],evidence:["GitHub repos","Code samples"]},
  {name:"SQL & Database Design",cat:"Technical",score:3,max:5,def:"Complex queries, schema design, and optimisation.",why:"Data retrieval and reporting is a daily function.",synonyms:["PostgreSQL","T-SQL"],evidence:["Query portfolio"]},
  {name:"Machine Learning",cat:"Technical",score:2,max:5,def:"ML algorithms, model training, evaluation, and deployment.",why:"Role involves building and maintaining ML pipelines.",synonyms:["ML","Deep Learning","Scikit-learn"],evidence:["Kaggle projects"]},
  {name:"Cloud Infrastructure",cat:"Technical",score:2,max:5,def:"Working knowledge of cloud platforms.",why:"All services run on AWS.",synonyms:["AWS","GCP","Azure"],evidence:["Certifications"]},
  {name:"Data Visualisation",cat:"Domain",score:3,max:5,def:"Clear, insightful visualisations for stakeholders.",why:"Presenting findings weekly.",synonyms:["Tableau","Power BI"],evidence:["Dashboard portfolio"]},
  {name:"Communication",cat:"Soft Skill",score:4,max:5,def:"Clear written and verbal communication.",why:"Cross-functional collaboration.",synonyms:["Presentation","Documentation"],evidence:["Writing samples"]},
  {name:"Problem Solving",cat:"Soft Skill",score:4,max:5,def:"Analytical thinking and structured approach.",why:"Debugging complex data pipeline issues.",synonyms:["Critical thinking"],evidence:["Case study responses"]},
  {name:"AWS Certified",cat:"Certification",score:1,max:5,def:"Cloud certification preferred.",why:"Signals cloud competency to hiring teams.",synonyms:["AWS SAA"],evidence:["Certificate"]},
];

export const RESOURCES=[
  {id:"r1",title:"Python for Data Science Handbook",type:"doc",provider:"O'Reilly",diff:"Intermediate",hours:12,comp:"Python Programming",why:"Fills gap in data-oriented Python patterns",url:"#"},
  {id:"r2",title:"Complete SQL Bootcamp",type:"course",provider:"Udemy",diff:"Beginner",hours:20,comp:"SQL & Database Design",why:"Comprehensive coverage of query patterns needed for the role",url:"#"},
  {id:"r3",title:"Machine Learning Specialisation",type:"course",provider:"Coursera (Stanford)",diff:"Intermediate",hours:60,comp:"Machine Learning",why:"Top-rated ML course; covers algorithms in job description",url:"#"},
  {id:"r4",title:"AWS Solutions Architect â€” Associate Prep",type:"course",provider:"A Cloud Guru",diff:"Intermediate",hours:40,comp:"Cloud Infrastructure",why:"Direct preparation for preferred certification",url:"#"},
  {id:"r5",title:"Storytelling with Data",type:"doc",provider:"Wiley",diff:"Beginner",hours:6,comp:"Data Visualisation",why:"Practical framework for presenting insights",url:"#"},
  {id:"r6",title:"Scikit-learn Official Docs",type:"doc",provider:"scikit-learn.org",diff:"Intermediate",hours:8,comp:"Machine Learning",why:"Essential reference for ML implementation",url:"#"},
];

export const INSTS=[
  {name:"University of Cape Town â€” Online Short Courses",url:"https://www.getsmarter.com/universities/uct",desc:"UCT offers accredited short courses through GetSmarter, covering data science, ML, and business analytics.",bestFor:"Accredited short courses with university recognition",offerings:["Data Science","Machine Learning","FinTech"],recog:"Internationally recognised; NQF-aligned",cat:"University"},
  {name:"AWS Training & Certification",url:"https://aws.amazon.com/training/",desc:"Amazon's official certification programme for cloud practitioners and architects.",bestFor:"Cloud certification directly from the vendor",offerings:["Cloud Practitioner","Solutions Architect","Data Analytics"],recog:"Industry gold standard for AWS roles",cat:"Vendor Cert"},
  {name:"Coursera (Stanford, Google)",url:"https://coursera.org",desc:"Global online learning with university-partnered specialisations. Quality varies â€” focus on top university specialisations.",bestFor:"Structured learning paths with certificates",offerings:["ML Specialisation","Google Data Analytics","Python for Everybody"],recog:"Widely recognised; financial aid available",cat:"Online Platform"},
  {name:"Explore Data Science Academy",url:"https://explore-datascience.net",desc:"South African data science academy with strong industry partnerships.",bestFor:"Intensive SA-based data science training",offerings:["Data Science bootcamp","Data Engineering","ML Engineering"],recog:"Well-regarded in SA tech; employer partnerships",cat:"Local Bootcamp"},
  {name:"CompTIA",url:"https://comptia.org",desc:"Vendor-neutral IT certification body for foundational infrastructure knowledge.",bestFor:"Vendor-neutral IT fundamentals",offerings:["Data+","Cloud+","Security+"],recog:"Globally recognised baseline certifications",cat:"Vendor Cert"},
  {name:"Microsoft Learn",url:"https://learn.microsoft.com",desc:"Free learning platform with hands-on labs for Azure, Power BI, and Microsoft technologies.",bestFor:"Free structured learning with sandbox environments",offerings:["Azure Fundamentals","Power BI Analyst","Azure Data Engineer"],recog:"Industry-standard Microsoft certifications",cat:"Vendor Cert"},
];

export const QUESTIONS=[
  {id:"q1",comp:"Python",type:"mcq",q:"What is the output of `[x**2 for x in range(5)]`?",opts:["[0, 1, 4, 9, 16]","[1, 4, 9, 16, 25]","[0, 1, 2, 3, 4]","Error"],correct:0,explain:"List comprehension iterates 0â€“4; squaring gives [0, 1, 4, 9, 16]."},
  {id:"q2",comp:"Python",type:"mcq",q:"Which library is primarily used for numerical computing with arrays?",opts:["Pandas","NumPy","Matplotlib","Requests"],correct:1,explain:"NumPy is foundational for numerical computing."},
  {id:"q3",comp:"SQL",type:"mcq",q:"What does a LEFT JOIN return?",opts:["Only matching rows","All from left + matching from right","All from both tables","Only non-matching"],correct:1,explain:"LEFT JOIN preserves all left table rows."},
  {id:"q4",comp:"ML",type:"mcq",q:"Best metric for imbalanced binary classification?",opts:["Accuracy","F1 Score","MSE","RÂ² Score"],correct:1,explain:"F1 balances precision and recall for skewed distributions."},
  {id:"q5",comp:"Cloud",type:"mcq",q:"Which AWS service is serverless compute?",opts:["EC2","Lambda","RDS","S3"],correct:1,explain:"Lambda runs code without server provisioning."},
  {id:"q6",comp:"Visualisation",type:"scenario",q:"A non-technical stakeholder wants quarterly revenue trends. Describe your visualisation approach.",sample:"Simple line chart, clear labels, annotations at inflection points, narrative summary."},
];

export const PODCAST_TURNS=[
  {speaker:"Moderator",name:"Thandiwe",content:"Welcome to SkillBridge Insights! Today we break down what it takes to land a Data Analyst role in SA's tech sector. What do hiring teams actually look for?",ch:"Introduction"},
  {speaker:"Hiring Manager",name:"Sipho",content:"When I review CVs, I look for evidence of problem-solving first â€” not just a tool list. Can you take messy data and extract insight? That said, Python and SQL are table stakes now.",ch:"What Hiring Teams Want"},
  {speaker:"Domain Expert",name:"Dr Aisha",content:"The landscape has shifted. Five years ago, Excel was enough. Now you need Python, SQL, and a visualisation tool minimum. But statistical foundations matter â€” many candidates run models without understanding why.",ch:"What Hiring Teams Want"},
  {speaker:"User Avatar",name:"You",content:"I've learnt Python for six months and I'm comfortable with Pandas. Where should I focus next for this role?",ch:"Skill Prioritisation"},
  {speaker:"Domain Expert",name:"Dr Aisha",content:"Given your foundation, prioritise SQL depth â€” window functions, CTEs, query optimisation. The job description mentions 'complex reporting queries'. Simultaneously, start a small ML project.",ch:"Skill Prioritisation"},
  {speaker:"Hiring Manager",name:"Sipho",content:"I'd second SQL. I often give interview candidates a data problem and ask them to write a query. Also â€” practise explaining your work to non-technical people. That skill separates good from great analysts.",ch:"Skill Prioritisation"},
];

export const PORTFOLIO=[
  {title:"Customer Churn Prediction Pipeline",desc:"Build an end-to-end ML pipeline that predicts churn for a telecoms company: data cleaning, feature engineering, model training, evaluation, and a Streamlit dashboard.",reqs:["Clean and explore a public telecoms dataset","Engineer at least 5 features","Train and compare 3 models","Deploy a Streamlit dashboard","Write a clear README"],stack:{beginner:"Python, Pandas, Scikit-learn, Streamlit",advanced:"Python, PySpark, XGBoost, FastAPI, Docker"},rubric:["Data quality handling","Feature engineering creativity","Model evaluation rigour","Communication clarity","Code quality"],tip:"Walk through feature engineering decisions. Hiring managers love the 'why' behind choices."},
  {title:"Automated Reporting Dashboard",desc:"Create an automated weekly dashboard pulling from a public API, processing data, and generating visual summaries.",reqs:["Fetch data from a public API","Automate processing with scheduled scripts","Build interactive dashboard with filters","4+ chart types","Written summary with key insights"],stack:{beginner:"Python, Pandas, Plotly/Dash",advanced:"Python, Airflow, dbt, Metabase"},rubric:["Automation reliability","Visualisation quality","Insight depth","UX design","Documentation"],tip:"Emphasise automation â€” hiring teams value analysts who reduce manual work."},
];

// ============================================================
// PAGES
// ============================================================
