import Home from '../pages/Home.js';
import InfluencerLogin from'../pages/InfluencerLogin.js';
import SponsorLogin from '../pages/Sponsorlogin.js';
import AdminLogin from '../pages/Adminlogin.js';
import AdminPage from '../pages/Adminpage.js';
import SponsorPage from '../pages/Sponsorpage.js';
import InfluencerPage from '../pages/Influencerpage.js';
import InfluencerSignup from '../pages/InfluencerSignup.js';
import SponsorSignup from '../pages/SponsorSignup.js';

const routes = [
    { path: "/", component: Home },
    { path: "/adminpage", component: AdminPage,meta: { requiresAuth: true }},
    { path: "/sponsorpage", component: SponsorPage,meta: { requiresAuth: true }},
    { path: "/influencerpage", component: InfluencerPage,meta: { requiresAuth: true } },
    { path: "/signup/influencer", component: InfluencerSignup},
    { path: "/signup/Sponsor", component: SponsorSignup},
    { path: "/login/influencer",component: InfluencerLogin},
    { path: "/login/sponsor",component: SponsorLogin},
    { path: "/login/admin",component: AdminLogin},   
    
];


const router = new VueRouter({
    mode: 'history',
    routes,
});


export default router;

