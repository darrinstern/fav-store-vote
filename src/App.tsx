import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SearchIcon, Trophy, Star, MapPin, Clock, Zap, TrendingUp, Users, Gift, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StoreSearch } from './StoreSearch';
import { VoteModal } from './VoteModal';
import { AddStoreModal } from './AddStoreModal';
import { AuthModal } from './AuthModal';
import { SMSVotingGuide } from './SMSVotingGuide';
import { AdminPanel } from './AdminPanel';
import { ShareButton } from './ShareButton';
import { StorePromotion } from './StorePromotion';
import { StoreDetailsModal } from './StoreDetailsModal';
import { NearbyStores } from './NearbyStores';
import { Header } from './Header';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatMerchandise } from '@/lib/utils';

interface Store {
  id: string;
  shopId?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  shopEmail?: string;
  shopOwner?: string;
  shopHours?: string;
  votes: number;
  rating: number;
  testimonials: string[];
  category: string;
  approved: boolean;
}

interface User {
  email: string;
  zipCode: string;
  isAdmin?: boolean;
}

const VoteApp = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showStoreDetailsModal, setShowStoreDetailsModal] = useState(false);
  const [selectedStoreForDetails, setSelectedStoreForDetails] = useState<Store | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [selectedState, setSelectedState] = useState('all');
  const [activeTab, setActiveTab] = useState('national');
  const { toast } = useToast();

  // Load approved stores from Supabase
  const mapRowToStore = (row: any): Store => ({
    id: row.ShopID,
    shopId: row.ShopID ?? undefined,
    name: row.shop_name ?? 'Unknown Store',
    address: row.shop_addr_1 ?? row.shop_addr_1_m ?? '',
    city: row.shop_city ?? row.shop_city_m ?? '',
    state: row.shop_state ?? row.shop_state_m ?? '',
    zipCode: row.shop_zip ?? row.shop_zip_m ?? '',
    shopEmail: undefined,
    shopOwner: undefined,
    shopHours: row.shop_hours ?? undefined,
    votes: row.votes_count ?? 0,
    rating: Number(row.rating ?? 0),
    testimonials: [],
    category: formatMerchandise(row.shop_mdse),
    approved: row.approved ?? false,
  });

  const { data: stores = [], isLoading: isStoresLoading } = useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores')
        .select(`
          "ShopID",
          shop_name,
          shop_addr_1,
          shop_addr_2,
          shop_city,
          shop_state,
          shop_zip,
          shop_addr_1_m,
          shop_addr_2_m,
          shop_city_m,
          shop_state_m,
          shop_zip_m,
          shop_hours,
          shop_mdse,
          shop_website,
          votes_count,
          rating,
          approved,
          created_at,
          updated_at
        `)
        .eq('approved', true)
        .order('votes_count', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapRowToStore);
    },
    staleTime: 60_000,
  });

  const states = Array.from(new Set(stores.map(s => s.state).filter(Boolean))).sort();
  
  const getTopStores = () => {
    const list = activeTab === 'state' && selectedState !== 'all'
      ? stores.filter(store => store.state === selectedState)
      : stores;
    return list.slice(0, 10);
  };

  const contestEndDate = new Date('2024-08-15');
  const timeLeft = Math.max(0, Math.ceil((contestEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  const handleVote = (store: Store) => {
    if (!user) {
      toast({
        title: "Please log in to vote",
        description: "You need to be logged in to vote for stores.",
      });
      return;
    }
    setSelectedStore(store);
    setShowVoteModal(true);
  };

  const handleStoreClick = (store: Store) => {
    setSelectedStoreForDetails(store);
    setShowStoreDetailsModal(true);
  };

  const handleAuthSuccess = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    toast({
      title: "Logged out successfully",
    });
  };

  // Show admin panel if user is admin
  if (user?.isAdmin) {
    return <AdminPanel />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Header user={user} onLogout={handleLogout} onAuthSuccess={handleAuthSuccess} />

      {/* Modern Hero Section with Glassmorphism */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800">
          <div className="absolute inset-0 bg-black/20"></div>
          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center text-white">
          {/* Floating Trophy with Glow Effect */}
          <div className="relative mb-8 inline-block">
            <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-50 animate-pulse scale-150"></div>
            <Trophy className="relative h-24 w-24 text-yellow-400 animate-bounce" />
          </div>

          {/* Main Headline with Gradient Text */}
          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent">
              Craft Retail
            </span>
            <br />
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent animate-pulse">
              Champions
            </span>
          </h1>

          {/* Dynamic Stats Bar */}
          <div className="flex justify-center items-center gap-8 mb-8 flex-wrap">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-300" />
                <span className="font-bold text-xl">{stores.reduce((sum, store) => sum + store.votes, 0).toLocaleString()}</span>
                <span className="text-blue-200">votes cast</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-300" />
                <span className="font-bold text-xl">{stores.length}</span>
                <span className="text-green-200">stores competing</span>
              </div>
            </div>
          </div>

          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto font-light leading-relaxed text-white/90">
            🎨 <span className="font-semibold">Vote for your favorite craft stores</span> and help them win incredible prizes! 
            Every vote counts toward crowning the 2025 champions.
          </p>

          {/* Urgent CTA Section */}
          <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-lg rounded-3xl p-8 mb-12 border border-white/20 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Clock className="h-6 w-6 text-red-300 animate-pulse" />
              <span className="text-xl font-bold text-red-100">Contest Ending Soon!</span>
            </div>
            <div className="text-3xl font-black mb-4 text-white">
              {timeLeft} Days Left
            </div>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold text-lg px-8 py-4 rounded-2xl shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 transform hover:scale-105 group"
              onClick={() => {
                const searchSection = document.querySelector('[data-search-section]');
                searchSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Zap className="h-5 w-5 mr-2 group-hover:animate-pulse" />
              Start Voting Now
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-sm text-white/70 mt-3">
              ⚡ Vote now and enter to win a $500 shopping spree!
            </p>
          </div>

          {/* Quick Vote Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-4xl mx-auto border border-white/20" data-search-section>
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="h-6 w-6 text-yellow-400" />
              <h3 className="text-2xl font-bold">Find Your Favorite Store</h3>
              <Sparkles className="h-6 w-6 text-yellow-400" />
            </div>
            <StoreSearch 
              onStoreSelect={(store) => handleVote(store)}
              onAddNewStore={() => {
                if (!user) {
                  toast({
                    title: "Please log in to add stores",
                    description: "You need to be logged in to add new stores.",
                  });
                }
              }}
              onStoreClick={handleStoreClick}
            />
          </div>
        </div>
      </section>

      {/* Top Stores Nearby Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <TrendingUp className="h-4 w-4" />
              Popular in Your Area
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Vote for Local Champions
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              These craft stores are trending near you. Give them your vote to help them climb the leaderboard!
            </p>
          </div>
          
          <NearbyStores
            onStoreSelect={(store) => handleVote(store)}
            onStoreClick={handleStoreClick}
          />
        </div>
      </section>

      {/* Current Leaders with Modern Cards */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-900 to-indigo-900 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-4 py-2 rounded-full text-sm font-bold mb-4">
              <Trophy className="h-4 w-4" />
              Live Leaderboard
            </div>
            <h2 className="text-4xl md:text-6xl font-black mb-4">
              Current <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Champions</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              These amazing stores are leading the race! Vote now to support your favorites or help them climb higher.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-white/10 backdrop-blur-md">
              <TabsTrigger value="national" className="data-[state=active]:bg-white/20">Top 10 National</TabsTrigger>
              <TabsTrigger value="state" className="data-[state=active]:bg-white/20">Winners by State</TabsTrigger>
            </TabsList>
            
            <TabsContent value="state" className="mt-8">
              <div className="flex justify-center mb-8">
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger className="w-64 bg-white/10 backdrop-blur-md border-white/20">
                    <SelectValue placeholder="Select a state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    {states.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {getTopStores().map((store, index) => (
              <Card 
                key={store.id} 
                className={`group cursor-pointer transition-all duration-500 hover:scale-105 border-0 overflow-hidden ${
                  index === 0 
                    ? 'bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 shadow-2xl shadow-yellow-500/25' 
                    : 'bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20'
                }`}
                onClick={() => handleVote(store)}
              >
                <CardHeader className="relative pb-2">
                  {index === 0 && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-black text-yellow-400 font-bold px-3 py-1 animate-pulse">
                        👑 #1 LEADER
                      </Badge>
                    </div>
                  )}
                  {index === 1 && (
                    <div className="absolute -top-3 right-2">
                      <Badge className="bg-slate-400 text-white font-bold">
                        🥈 #2
                      </Badge>
                    </div>
                  )}
                  {index === 2 && (
                    <div className="absolute -top-3 right-2">
                      <Badge className="bg-orange-600 text-white font-bold">
                        🥉 #3
                      </Badge>
                    </div>
                  )}

                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle 
                        className={`text-xl font-bold cursor-pointer hover:underline transition-colors ${
                          index === 0 ? 'text-black' : 'text-white'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStoreClick(store);
                        }}
                      >
                        {store.name}
                      </CardTitle>
                      <div className={`flex items-center gap-1 text-sm mt-1 ${
                        index === 0 ? 'text-black/70' : 'text-white/70'
                      }`}>
                        <MapPin className="h-4 w-4" />
                        {store.city}, {store.state}
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs mt-2 ${
                          index === 0 
                            ? 'bg-black/20 text-black font-semibold' 
                            : 'bg-white/20 text-white'
                        }`}
                      >
                        {store.category}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-black ${
                        index === 0 ? 'text-black' : 'text-white'
                      }`}>
                        {store.votes.toLocaleString()}
                      </div>
                      <div className={`text-sm ${
                        index === 0 ? 'text-black/70' : 'text-white/70'
                      }`}>
                        votes
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(store.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : index === 0 ? 'text-black/30' : 'text-white/30'
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-sm font-bold ${
                      index === 0 ? 'text-black' : 'text-white'
                    }`}>
                      {store.rating.toFixed(1)}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <Button 
                      className={`w-full font-bold transition-all duration-300 transform hover:scale-105 ${
                        index === 0 
                          ? 'bg-black text-yellow-400 hover:bg-black/80 shadow-lg hover:shadow-xl' 
                          : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                      }`}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Vote Now
                    </Button>
                    
                    <ShareButton 
                      title={`Vote for ${store.name} in Craft Retail Champions!`}
                      url={`${window.location.origin}?store=${store.id}`}
                      description={`${store.name} is competing for Craft Retail Champion! They have ${store.votes} votes. Help them win!`}
                      variant="ghost"
                      size="sm"
                      className={index === 0 ? 'text-black hover:bg-black/10' : 'text-white hover:bg-white/10'}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-lg rounded-3xl p-8 border border-white/20 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">Don't See Your Favorite?</h3>
              <p className="text-white/80 mb-6">Search for your favorite craft store and cast your vote to help them join the leaderboard!</p>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold"
                onClick={() => {
                  const searchSection = document.querySelector('[data-search-section]');
                  searchSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Find & Vote for Your Store
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Store Promotion Toolkit */}
      <StorePromotion />

      {/* SMS Voting Guide */}
      <SMSVotingGuide />

      {/* Winner Benefits & Voter Lottery - Modernized */}
      <section className="py-20 px-4 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-yellow-400/20 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-pink-400/20 rounded-full animate-pulse delay-500"></div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
              <Gift className="h-4 w-4" />
              Amazing Prizes Await
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              What's at <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Stake</span>
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Winners get massive exposure and voters enter to win incredible prizes!
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-2">
            {/* Store Winners Benefits - Modernized */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Store Champions Win</h3>
                  <p className="text-white/70">Incredible marketing opportunities</p>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  "Featured promotion across our trade show network",
                  "Marketing materials and press release templates",
                  "Champion badge and certificate for display",
                  "Social media spotlight and community recognition",
                  "Exclusive winner networking opportunities"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3 group">
                    <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform">
                      <span className="text-xs font-bold text-white">✓</span>
                    </div>
                    <p className="text-white/90 group-hover:text-white transition-colors">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Voter Prizes - Modernized */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Gift className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Voters Enter to Win</h3>
                  <p className="text-white/70">Amazing prizes for participants</p>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  "$500 craft store shopping spree (Grand Prize)",
                  "Exclusive craft supply bundles from sponsors",
                  "Free trade show passes and workshop access",
                  "Premium crafting tools and equipment"
                ].map((prize, index) => (
                  <div key={index} className="flex items-start gap-3 group">
                    <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform">
                      <span className="text-xs font-bold text-white">🎁</span>
                    </div>
                    <p className="text-white/90 group-hover:text-white transition-colors">{prize}</p>
                  </div>
                ))}
              </div>
              
              <div className="bg-gradient-to-r from-yellow-500/30 to-orange-500/30 rounded-2xl p-4 mt-6 border border-white/20">
                <p className="text-white font-semibold text-center">
                  🎲 Every vote = 1 lottery entry. More votes = better chances to win!
                </p>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center mt-16">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 max-w-2xl mx-auto">
              <p className="text-xl text-white/90 mb-6">
                Ready to make a difference in the craft retail community?
              </p>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold text-lg px-12 py-4 rounded-2xl shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 transform hover:scale-105"
                onClick={() => {
                  const searchSection = document.querySelector('[data-search-section]');
                  searchSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Start Voting Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works - Modernized */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
              <Zap className="h-4 w-4" />
              Simple & Fast
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Voting for your favorite craft store takes less than 2 minutes!
            </p>
          </div>

          <div className="grid gap-12 md:grid-cols-3 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-indigo-200"></div>
            
            {/* Step 1 */}
            <div className="text-center group">
              <div className="relative mb-6 mx-auto w-24 h-24">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-300"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl w-full h-full flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300">
                  <SearchIcon className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-black text-sm">
                  1
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-800">Search & Discover</h3>
              <p className="text-slate-600 leading-relaxed">
                Find your favorite store by ZIP code, city name, or store name. Discover new craft stores in your area!
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="relative mb-6 mx-auto w-24 h-24">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-300"></div>
                <div className="relative bg-gradient-to-r from-purple-500 to-purple-700 rounded-2xl w-full h-full flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300">
                  <Zap className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-black text-sm">
                  2
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-800">Vote & Share</h3>
              <p className="text-slate-600 leading-relaxed">
                Cast your vote with one click and share a testimonial about your experience. Help others discover great stores!
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="relative mb-6 mx-auto w-24 h-24">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-300"></div>
                <div className="relative bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl w-full h-full flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300">
                  <Trophy className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-black text-sm">
                  3
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-800">Win Together</h3>
              <p className="text-slate-600 leading-relaxed">
                Top stores get amazing recognition and marketing opportunities. You get entered to win incredible prizes!
              </p>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 border border-blue-100">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Ready to Get Started?</h3>
              <p className="text-slate-600 mb-6 max-w-xl mx-auto">
                Join thousands of craft enthusiasts who are already voting for their favorite stores!
              </p>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => {
                  const searchSection = document.querySelector('[data-search-section]');
                  searchSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Find My Store & Vote
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsor Section - Modernized */}
      <section className="py-16 px-4 bg-white border-t border-slate-200">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="text-lg font-semibold text-slate-600 mb-8">
              Craft Retail Champions is proudly owned and managed by:
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-12 opacity-75 hover:opacity-100 transition-opacity">
              <div className="grayscale hover:grayscale-0 transition-all duration-300 transform hover:scale-105">
                <img 
                  src="/lovable-uploads/3bd255e3-a72d-40f7-8ed5-1247212390a5.png" 
                  alt="h+h americas" 
                  className="h-16 w-auto" 
                />
              </div>
              <div className="grayscale hover:grayscale-0 transition-all duration-300 transform hover:scale-105">
                <img 
                  src="/lovable-uploads/d80dca82-3afa-455c-a057-33f1f6967df0.png" 
                  alt="Fiber+Fabric Craft Festival" 
                  className="h-16 w-auto" 
                />
              </div>
              <div className="grayscale hover:grayscale-0 transition-all duration-300 transform hover:scale-105">
                <img 
                  src="https://media.koelnmesse.io/koelnmesse/redaktionell/koelnmesse/img_40/koelnmesse_logo_claim.svg" 
                  alt="Koelnmesse" 
                  className="h-16 w-auto" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-slate-900 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
          }}></div>
        </div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="grid gap-12 lg:grid-cols-4 md:grid-cols-2">
            {/* Brand Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-black" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Craft Retail Champions
                </span>
              </div>
              <p className="text-slate-300 max-w-md leading-relaxed">
                Celebrating excellence in craft retail across North America. Supporting local businesses and connecting communities through craft.
              </p>
              <div className="flex gap-4">
                <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-white/10">
                  Follow Us
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-white/10">
                  Newsletter
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h4 className="font-bold text-white text-lg">Quick Links</h4>
              <ul className="space-y-3">
                {['About', 'Media Kit', 'Sponsors', 'Privacy Policy', 'Terms of Service'].map((link) => (
                  <li key={link}>
                    <a 
                      href={`/${link.toLowerCase().replace(' ', '-')}`} 
                      className="text-slate-300 hover:text-white transition-colors duration-200 hover:underline"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-6">
              <h4 className="font-bold text-white text-lg">Get Help</h4>
              <ul className="space-y-3">
                {['Support', 'Media Inquiries', 'Partnership', 'Technical Issues'].map((link) => (
                  <li key={link}>
                    <a 
                      href="#" 
                      className="text-slate-300 hover:text-white transition-colors duration-200 hover:underline"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-16 pt-8 border-t border-slate-700">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Copyright */}
              <div className="text-sm text-slate-400">
                <p className="mb-2">
                  © 2024 Koelnmesse Inc. All Rights Reserved. 
                </p>
                <p>
                  The Fiber+Fabric Craft Festival & h+h americas logo is a registered trademark of Koelnmesse Inc.
                </p>
              </div>

              {/* Legal Links */}
              <div className="flex flex-wrap gap-6 text-sm">
                {['Legal Notice', 'Security & Data Protection', 'Cookie Notice', 'Sitemap'].map((link, index) => (
                  <span key={link} className="flex items-center gap-2">
                    {index > 0 && <span className="text-slate-600">|</span>}
                    <a href="#" className="text-slate-400 hover:text-white transition-colors">
                      {link}
                    </a>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <VoteModal
        store={selectedStore}
        isOpen={showVoteModal}
        onClose={() => setShowVoteModal(false)}
        user={user}
      />

      <StoreDetailsModal
        store={selectedStoreForDetails}
        isOpen={showStoreDetailsModal}
        onClose={() => setShowStoreDetailsModal(false)}
        onVote={handleVote}
      />
    </div>
  );
};

export default VoteApp;
