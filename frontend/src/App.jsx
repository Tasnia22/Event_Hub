import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import About from './pages/About';
import Help from './pages/Help';
import CustomerHome from './pages/customer/Home';
import EventDetails from './pages/customer/EventDetails';
import Booking from './pages/customer/Booking';
import MyBookings from './pages/customer/MyBookings';
import OrganizerDashboard from './pages/organizer/Dashboard';
import CreateEvent from './pages/organizer/CreateEvent';
import EditEvent from './pages/organizer/EditEvent';
import MyEvents from './pages/organizer/MyEvents';
import OrganizerBookings from './pages/organizer/Bookings';
import CheckIn from './pages/organizer/CheckIn';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/about" element={<About />} />
        <Route path="/help" element={<Help />} />
        <Route path="/customer/home" element={<CustomerHome />} />
        <Route path="/customer/event/:id" element={<EventDetails />} />
        <Route path="/customer/booking/:id" element={<Booking />} />
        <Route path="/customer/bookings" element={<MyBookings />} />
        <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
        <Route path="/organizer/create-event" element={<CreateEvent />} />
        <Route path="/organizer/edit-event/:id" element={<EditEvent />} />
        <Route path="/organizer/events" element={<MyEvents />} />
        <Route path="/organizer/bookings" element={<OrganizerBookings />} />
        <Route path="/organizer/checkin" element={<CheckIn />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;