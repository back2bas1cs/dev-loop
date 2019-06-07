import React, { Component } from 'react';
// import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

class NavBar extends Component {
  constructor() {
    super();
    this.state = {
      lastPageTop: 0,
      navClass: ''
    }
    this.handleScroll = this.handleScroll.bind(this);
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll() {
    const currentPageTop = window.pageYOffset;
      // if current scroll height is greater than offset (100), and the last scroll height (state) is less than offset, toggle navbar
    const TOGGLE_OFFSET = 100;
    let navClass = '';
    if (currentPageTop > TOGGLE_OFFSET && this.state.lastPageTop < TOGGLE_OFFSET) {
      navClass = 'nav-toggled';
    }
    this.setState({
      lastScrollY: currentPageTop,
      navClass
    });
  }

  render() {
    return (
      // <ReactCSSTransitionGroup
      //   transitionName="navTrans"
      //   transitionEnterTimeout={ 500 }
      //   transitionLeaveTimeout={ 300 }>
        <nav className={ this.state.navClass }>
          <div className="nav-sections">
            <div className="nav-brand">
              <a href="#landing-welcome">
                Dev X
              </a>
            </div>

            <div className="nav-auth">
              <div className="nav-sign-in">
                {/* still need to make this work with the back-end */}
                <form action="#">
                  <input type="text"
                    name="email"
                    placeholder="email" />
                  <input type="password"
                    name="password"
                    placeholder="password" />
                  <input type="submit" value="Sign in" />
                </form>
              </div>
              <div className="nav-register">
                <a href="#register">
                  Register
                </a>
              </div>
            </div>

            <div className="nav-search">
              <a href="#search">
                <i className="fas fa-search"></i>
              </a>
            </div>
          </div>
        </nav>
      // </ReactCSSTransitionGroup>

    );
  }
};

export default NavBar;
