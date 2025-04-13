import axios from 'axios';

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: {
    name: string;
  };
  category: 'healthcare' | 'disease' | 'policy' | 'research';
  publishedAt: string;
}

interface HealthNewsResponse {
  articles: NewsArticle[];
}

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const NEWS_API_URL = 'https://newsapi.org/v2/everything';

// Helper function to categorize articles based on content
const categorizeArticle = (title: string, description: string): NewsArticle['category'] => {
  const text = (title + ' ' + description).toLowerCase();
  
  // Disease related keywords
  if (text.match(/virus|disease|infection|outbreak|pandemic|epidemic|covid|cancer|diabetes|stroke/)) {
    return 'disease';
  }
  
  // Research related keywords
  if (text.match(/study|research|trial|discovery|breakthrough|scientists|researchers/)) {
    return 'research';
  }
  
  // Policy related keywords
  if (text.match(/policy|regulation|law|government|legislation|medicare|medicaid|insurance/)) {
    return 'policy';
  }
  
  // Default to healthcare
  return 'healthcare';
};

export const fetchHealthNews = async (): Promise<NewsArticle[]> => {
  if (!NEWS_API_KEY || NEWS_API_KEY === 'your_news_api_key_here') {
    throw new Error('Please add your News API key to the .env file. Get one from https://newsapi.org/register');
  }

  try {
    // Make multiple queries to get diverse health news
    const queries = [
      'disease OR virus OR outbreak OR pandemic',
      'medical research OR health study OR clinical trial',
      'healthcare policy OR medical legislation',
      'public health OR healthcare system'
    ];
    
    const responses = await Promise.all(
      queries.map(q => 
        axios.get<HealthNewsResponse>(NEWS_API_URL, {
          params: {
            q: q,
            language: 'en',
            sortBy: 'publishedAt',
            pageSize: 10,
            apiKey: NEWS_API_KEY,
          },
        })
      )
    );

    // Combine all articles and remove duplicates
    const allArticles = responses.flatMap(response => response.data.articles);
    const uniqueArticles = Array.from(new Map(allArticles.map(article => [article.url, article])).values());

    if (uniqueArticles.length === 0) {
      throw new Error('No health news articles found. Please check your API key and try again.');
    }

    // Transform and categorize articles
    return uniqueArticles.map(article => ({
      title: article.title,
      description: article.description || '',
      url: article.url,
      source: {
        name: article.source.name,
      },
      category: categorizeArticle(article.title, article.description),
      publishedAt: article.publishedAt,
    }));
  } catch (error) {
    console.error('Error fetching health news:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Invalid News API key. Please check your API key in the .env file.');
      }
      if (error.response?.status === 429) {
        throw new Error('News API rate limit exceeded. Please try again later.');
      }
    }
    throw error;
  }
}; 