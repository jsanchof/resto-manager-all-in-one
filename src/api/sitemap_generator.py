from datetime import datetime
import os
from xml.etree import ElementTree as ET
from xml.dom import minidom


class SitemapGenerator:
    def __init__(self, base_url="https://elmexicano-restaurant.com"):
        self.base_url = base_url.rstrip("/")
        self.urls = []

    def add_url(self, path, priority=0.5, changefreq="weekly"):
        """Add a URL to the sitemap"""
        self.urls.append(
            {
                "loc": f"{self.base_url}{path}",
                "lastmod": datetime.now().strftime("%Y-%m-%d"),
                "priority": str(priority),
                "changefreq": changefreq,
            }
        )

    def generate(self):
        """Generate the sitemap XML"""
        # Create the root element
        urlset = ET.Element("urlset")
        urlset.set("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9")

        # Add URLs to the sitemap
        for url in self.urls:
            url_element = ET.SubElement(urlset, "url")
            for key, value in url.items():
                child = ET.SubElement(url_element, key)
                child.text = value

        # Create the XML string
        xml_str = minidom.parseString(ET.tostring(urlset)).toprettyxml(indent="  ")
        return xml_str

    def save(self, filepath="public/sitemap.xml"):
        """Save the sitemap to a file"""
        # Ensure directory exists
        os.makedirs(os.path.dirname(filepath), exist_ok=True)

        # Generate sitemap content
        xml_content = self.generate()

        # Write to file
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(xml_content)


def generate_sitemap():
    """Generate sitemap for the website"""
    sitemap = SitemapGenerator()

    # Add static pages
    sitemap.add_url("/", priority=1.0, changefreq="daily")
    sitemap.add_url("/menu", priority=0.9, changefreq="weekly")
    sitemap.add_url("/reservations", priority=0.8, changefreq="daily")
    sitemap.add_url("/contact", priority=0.7, changefreq="monthly")
    sitemap.add_url("/about-us", priority=0.6, changefreq="monthly")

    # Save the sitemap
    sitemap.save()


if __name__ == "__main__":
    generate_sitemap()
