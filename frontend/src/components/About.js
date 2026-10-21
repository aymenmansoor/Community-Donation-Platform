export default function About() {
  return <section className="text-center my-5 p-4 p-md-5 bg-light rounded-4 shadow-sm">
    <p className="fw-bold text-success">Our community, in bloom</p>
    <h1 className="display-5 fw-bold text-success">About ShareBloom</h1>
    <p className="lead text-muted mx-auto mt-4" style={{maxWidth:800}}>Share kindness. Give items a new beginning.</p>
    <p className="mx-auto text-muted" style={{maxWidth:800}}>ShareBloom connects people with useful items to people who can give them a new home. From textbooks for a new term to everyday household essentials, a thoughtful donation can make someone’s next step a little easier.</p>
    <div className="row g-4 mt-3">{[
      ['Give thoughtfully','Describe your item honestly, add a clear photograph and share only the contact details you are comfortable making visible.'],
      ['Request with care','Explain how an item would help you. Follow each request from pending to the donor’s decision.'],
      ['A supported community','Administrators review listings and account activity. Moderation supports the community; it does not verify every person or item.']
    ].map(([title,text]) => <div className="col-md-4" key={title}><div className="card rounded-4 border-0 h-100 p-4"><h2 className="h5 text-success">{title}</h2><p className="text-muted mb-0">{text}</p></div></div>)}</div>
    <p className="small text-muted mt-4 mb-0">The portfolio sample accounts and listings are fictional. Arrange handovers carefully and never share sensitive personal information.</p>
  </section>;
}
