// Mock API functions for demonstration

interface TranscriptBlock {
  id: string;
  text: string;
  confidence: number;
  timestamps: { start: number; end: number };
}

interface Keyword {
  term: string;
  score: number;
  offsetRanges: Array<{ start: number; end: number }>;
}

interface Explainer {
  summary: string;
  url: string;
  sourceName: string;
}

// Simulates ASR API call
export async function mockTranscribeAudio(blobUrl: string): Promise<TranscriptBlock[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Mock transcript data
  const mockTranscripts = [
    {
      id: '1',
      text: 'In today\'s quarterly review meeting, we discussed the implementation of our new customer relationship management system.',
      confidence: 0.95,
      timestamps: { start: 0, end: 5 }
    },
    {
      id: '2',
      text: 'The engineering team has completed the initial setup of Kubernetes clusters for our microservices architecture.',
      confidence: 0.92,
      timestamps: { start: 5, end: 10 }
    },
    {
      id: '3',
      text: 'We\'re also exploring machine learning models for predictive analytics in our data warehouse.',
      confidence: 0.88,
      timestamps: { start: 10, end: 14 }
    },
    {
      id: '4',
      text: 'The marketing team presented findings about our new SEO strategy and conversion rate optimization efforts.',
      confidence: 0.94,
      timestamps: { start: 14, end: 19 }
    },
    {
      id: '5',
      text: 'Next quarter, we plan to migrate our infrastructure to a serverless computing model using AWS Lambda.',
      confidence: 0.91,
      timestamps: { start: 19, end: 24 }
    }
  ];

  return mockTranscripts;
}

// Simulates keyword extraction API
export async function mockExtractKeywords(text: string): Promise<Keyword[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Mock keyword extraction based on common technical terms
  const keywords: Keyword[] = [
    { term: 'Kubernetes', score: 0.92, offsetRanges: [{ start: 150, end: 160 }] },
    { term: 'microservices architecture', score: 0.88, offsetRanges: [{ start: 180, end: 205 }] },
    { term: 'machine learning', score: 0.85, offsetRanges: [{ start: 220, end: 237 }] },
    { term: 'predictive analytics', score: 0.83, offsetRanges: [{ start: 250, end: 270 }] },
    { term: 'data warehouse', score: 0.81, offsetRanges: [{ start: 280, end: 294 }] },
    { term: 'SEO strategy', score: 0.79, offsetRanges: [{ start: 340, end: 352 }] },
    { term: 'conversion rate optimization', score: 0.86, offsetRanges: [{ start: 357, end: 385 }] },
    { term: 'serverless computing', score: 0.90, offsetRanges: [{ start: 450, end: 470 }] },
    { term: 'AWS Lambda', score: 0.87, offsetRanges: [{ start: 485, end: 495 }] },
    { term: 'CRM system', score: 0.78, offsetRanges: [{ start: 80, end: 90 }] }
  ];

  return keywords.sort((a, b) => b.score - a.score);
}

// Simulates explanation/definition API
export async function mockFetchExplainer(term: string): Promise<Explainer> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Mock explanations for common terms
  const explanations: Record<string, Explainer> = {
    'Kubernetes': {
      summary: 'Kubernetes (K8s) is an open-source container orchestration platform that automates the deployment, scaling, and management of containerized applications. It groups containers into logical units for easy management and discovery.',
      url: 'https://kubernetes.io/docs/concepts/overview/',
      sourceName: 'Kubernetes Documentation'
    },
    'microservices architecture': {
      summary: 'Microservices architecture is a design approach where a single application is composed of many loosely coupled and independently deployable smaller services. Each service typically runs in its own process and communicates via well-defined APIs.',
      url: 'https://en.wikipedia.org/wiki/Microservices',
      sourceName: 'Wikipedia'
    },
    'machine learning': {
      summary: 'Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. It focuses on developing computer programs that can access data and use it to learn for themselves.',
      url: 'https://en.wikipedia.org/wiki/Machine_learning',
      sourceName: 'Wikipedia'
    },
    'predictive analytics': {
      summary: 'Predictive analytics uses historical data, statistical algorithms, and machine learning techniques to identify the likelihood of future outcomes. It helps organizations forecast trends, behaviors, and events to make proactive decisions.',
      url: 'https://en.wikipedia.org/wiki/Predictive_analytics',
      sourceName: 'Wikipedia'
    },
    'data warehouse': {
      summary: 'A data warehouse is a centralized repository that stores integrated data from multiple sources. It\'s designed for query and analysis rather than transaction processing, supporting business intelligence activities like reporting and data mining.',
      url: 'https://en.wikipedia.org/wiki/Data_warehouse',
      sourceName: 'Wikipedia'
    },
    'SEO strategy': {
      summary: 'Search Engine Optimization (SEO) strategy is a comprehensive plan to improve a website\'s visibility in search engine results pages. It involves optimizing content, technical elements, and building authority to increase organic traffic.',
      url: 'https://en.wikipedia.org/wiki/Search_engine_optimization',
      sourceName: 'Wikipedia'
    },
    'conversion rate optimization': {
      summary: 'Conversion Rate Optimization (CRO) is the systematic process of increasing the percentage of website visitors who take a desired action. This involves testing different page elements, analyzing user behavior, and making data-driven improvements.',
      url: 'https://en.wikipedia.org/wiki/Conversion_rate_optimization',
      sourceName: 'Wikipedia'
    },
    'serverless computing': {
      summary: 'Serverless computing is a cloud computing execution model where the cloud provider dynamically manages the allocation of machine resources. Developers can build and run applications without managing infrastructure, paying only for actual usage.',
      url: 'https://en.wikipedia.org/wiki/Serverless_computing',
      sourceName: 'Wikipedia'
    },
    'AWS Lambda': {
      summary: 'AWS Lambda is a serverless compute service that runs code in response to events without requiring server management. It automatically scales applications and charges only for actual compute time used, supporting multiple programming languages.',
      url: 'https://aws.amazon.com/lambda/',
      sourceName: 'AWS Documentation'
    },
    'CRM system': {
      summary: 'Customer Relationship Management (CRM) systems help businesses manage interactions with current and potential customers. They organize customer data, track communications, automate sales processes, and provide analytics for better decision-making.',
      url: 'https://en.wikipedia.org/wiki/Customer_relationship_management',
      sourceName: 'Wikipedia'
    }
  };

  return explanations[term] || {
    summary: `${term} is a technical concept commonly used in software development and business operations. Further research recommended for detailed information.`,
    url: `https://www.google.com/search?q=${encodeURIComponent(term)}`,
    sourceName: 'General Knowledge'
  };
}
