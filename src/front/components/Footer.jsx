import tacoLogo from "../assets/taco.png"
import { Link } from "react-router-dom"

export const Footer = () => (

	<footer className="bg-light text-white pt-5 pb-3">
		<div className="container">
			<div className="row">

				{/* Logo and Social */}
				<div className="col-md-3 pe-5">
					<img
						src={tacoLogo}
						alt="Logo"
						className="img-fluid"
						style={{ maxWidth: '100px', height: 'auto' }}
					/>
					<p className="text-black pt-3 pb-4">Want to make a reservation? Call us and we'll be happy to help!</p>

					<div className="d-flex mt-3 gap-2 justify-content-start pb-5">
						<button className="btn border-0"><i className="social-icon fa-brands fa-instagram"></i></button>
						<button className="btn border-0"><i className="social-icon fa-brands fa-facebook-f"></i></button>
						<button className="btn border-0"><i className="social-icon fa-brands fa-twitter"></i></button>
						<button className="btn border-0"><i className="social-icon fa-brands fa-youtube"></i></button>
					</div>
				</div>

				{/* Quick Links */}
				<div className="col-md-2 mb-4">
					<h6 className="fw-bold text-black">QUICK LINKS</h6>
					<ul className="list-unstyled">
						<li>
							<Link to="/menu" className="text-secondary-emphasis text-decoration-none pt-3 pb-1">
								Menu
							</Link>
						</li>
						<li>
							<Link to="/contact" className="text-secondary-emphasis text-decoration-none pb-1">
								Call Us
							</Link>
						</li>
						<li>
							<Link to="/delivery" className="text-secondary-emphasis text-decoration-none pb-1">
								Delivery
							</Link>
						</li>
						<li>
							<Link to="/whatsapp" className="text-secondary-emphasis text-decoration-none pb-1">
								Order via WhatsApp
							</Link>
						</li>
					</ul>
				</div>

				{/* About Us Menu */}
				<div className="col-md-3 col-sm-6 mb-4">
					<h6 className="fw-bold text-black">ABOUT US</h6>
					<ul className="list-unstyled">
						<li className="mb-2">
							<Link to="/about-us" className="text-decoration-none text-muted">Our Story</Link>
						</li>
						<li className="mb-2">
							<Link to="/contact" className="text-decoration-none text-muted">Work with Us</Link>
						</li>
					</ul>
				</div>

				{/* Information */}
				<div className="col-md-2 mb-4">
					<h6 className="fw-bold text-black">INFORMATION</h6>
					<ul className="list-unstyled">
						<li>
							<p className="text-secondary-emphasis text-decoration-none pt-3 pb-1">
								Blvd. Valle de San Javier, 42086, Pachuca de Soto, Mexico
							</p>
						</li>
						<li>
							<h6 className="fw-bold text-black">HOURS:</h6>
							<p className="text-secondary-emphasis">8:00 am - 10:30 pm <br /> Monday to Sunday</p>
						</li>
					</ul>
				</div>

				{/* Apps */}
				<div className="col-md-2 mb-4 text-end invisible">
					<h6 className="text-black">INSTALL OUR APP</h6>
					<a href="#">
						<img
							src="https://w7.pngwing.com/pngs/772/166/png-transparent-download-on-the-app-store-button.png"
							alt="App Store"
							style={{ width: 130 }}
						/>
					</a>
					<br />
					<br />
					<a href="#">
						<img
							src="https://impulseradargpr.com/wp-content/uploads/2021/07/google-play-badge.png"
							alt="Google Play"
							style={{ width: 130 }}
						/>
					</a>
				</div>
			</div>

			{/* Bottom Line */}
			<div className="row pt-3 border-top border-secondary mt-4 text-black">
				<div className="col-md-4">
					<small>Terms and Conditions</small>
				</div>
				<div className="col-md-4 text-center text-black">
					<small>
						Copyright 2025 |
						Made with <i className="fa fa-heart text-danger" /> by{" "}
						<a href="http://www.4geeksacademy.com">4Geeks Academy Students</a>
					</small>
				</div>
				<div className="col-md-4 text-end text-black">
					<small>Cookie Policy</small>
				</div>
			</div>
		</div>
	</footer>

);
