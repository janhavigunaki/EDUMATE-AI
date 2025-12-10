import React, { useState } from 'react';
import { Search, ExternalLink } from 'lucide-react';
import { User, SearchResult } from '../types';
import { searchResources } from '../services/geminiService';

interface ResourcesProps {
  user: User;
}

const Resources: React.FC<ResourcesProps> = ({ user }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    // Enhance query for better results
    const enhancedQuery = `${query} for ${user.board} Class ${user.standard} previous year question papers question bank`;
    const data = await searchResources(enhancedQuery);
    setResults(data);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-800">Resource Library</h2>
        <p className="text-slate-500">Find Previous Year Question Papers (PYQs) and Question Banks tailored for your board.</p>
      </div>

      <form onSubmit={handleSearch} className="relative">
        <input 
          type="text" 
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search for 'Physics 2023 Paper' or 'Math Question Bank'"
          className="w-full px-6 py-4 rounded-full shadow-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 pl-14 text-lg"
        />
        <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400" size={24} />
        <button 
          type="submit" 
          className="absolute right-2 top-2 bottom-2 bg-indigo-600 text-white px-6 rounded-full font-medium hover:bg-indigo-700 transition"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      <div className="grid grid-cols-1 gap-4">
        {results.length > 0 ? (
          results.map((res, idx) => (
            <a 
              key={idx} 
              href={res.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition flex items-start justify-between group"
            >
              <div>
                <h3 className="font-semibold text-indigo-700 group-hover:underline text-lg">{res.title}</h3>
                <p className="text-slate-400 text-sm mt-1 truncate max-w-xl">{res.url}</p>
              </div>
              <ExternalLink className="text-slate-400 group-hover:text-indigo-600" size={20} />
            </a>
          ))
        ) : (
          !loading && <div className="text-center text-slate-400 mt-10">Try searching for a subject to see resources.</div>
        )}
      </div>

      <div className="mt-8 bg-amber-50 p-4 rounded-lg text-sm text-amber-800 border border-amber-100">
        <p><strong>Note:</strong> We provide links to external resources sourced via Google Search. Please verify the authenticity of the documents on the respective official board websites.</p>
      </div>
    </div>
  );
};

export default Resources;
