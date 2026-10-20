import React from 'react';

function About() {
  return (
    <div className="container mt-5">
      {/* About Us Section */}
      <section className="about-section text-center mb-5 p-5 bg-light rounded-4 shadow-sm">
        <h2 className="display-5 fw-bold text-success mb-4">About Our Mission</h2>
        <p className="lead text-muted mx-auto" style={{ maxWidth: '800px' }}>
          Welcome to <strong>Community Help</strong>. Our platform is dedicated to bridging the gap 
          between those who have resources and those who need them. We believe that 
          a small act of kindness—like donating a book, clothes, or toys—can make a 
          massive difference in someone's life.
        </p>
        <div className="row mt-5">
          <div className="col-md-4">
            <div className="p-3">
              <i className="bi bi-heart-fill text-danger fs-1"></i>
              <h4 className="mt-3 fw-bold">Pure Intent</h4>
              <p className="text-muted">Directly helping the community without any middlemen.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-3">
              <i className="bi bi-shield-check text-primary fs-1"></i>
              <h4 className="mt-3 fw-bold">Verified Donors</h4>
              <p className="text-muted">A secure platform where users can connect safely.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-3">
              <i className="bi bi-people-fill text-success fs-1"></i>
              <h4 className="mt-3 fw-bold">Impactful</h4>
              <p className="text-muted">Every item donated is a step towards a better society.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section className="contact-section mb-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card border-0 shadow-lg p-4 rounded-4">
              <h3 className="fw-bold text-success text-center mb-4">Contact Us</h3>
              <form>
                <div className="mb-3">
                  <label className="form-label fw-bold">Email Address</label>
                  <input type="email" className="form-control" placeholder="name@example.com" />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Message</label>
                  <textarea className="form-control" rows="4" placeholder="How can we help you?"></textarea>
                </div>
                <button type="button" className="btn btn-success w-100 fw-bold py-2 shadow-sm" onClick={() => alert("Thank you! We will get back to you soon.")}>
                  Send Message
                </button>
              </form>
              <div className="text-center mt-4">
                <p className="text-muted">Or reach us at:</p>
                <div className="d-flex justify-content-center gap-3 fs-4 text-success">
                  <i className="bi bi-envelope-at"></i>
                  <i className="bi bi-telephone"></i>
                  <i className="bi bi-geo-alt"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;