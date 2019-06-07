import React, { Component } from 'react';

// style loads before App renders
import '../styles/style.scss';

import NavBar from '../components/NavBar.jsx';
import Landing from '../components/Landing.jsx';
import Register from '../components/Register.jsx';
// import About from '../components/About.jsx';
// import Search from '../components/Search.jsx';
// import Footer from '../components/Footer.jsx';

class App extends Component {
  render() {
    return (
      <div>
        <NavBar />
        <Landing />
        <Register />
        {/*
          <About />
          <Search />
          <Footer />
        */}
      </div>
    );
  }
}

export default App;
