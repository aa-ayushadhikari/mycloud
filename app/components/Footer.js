import styles from './Footer.module.css';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Products',
      links: [
        { name: 'Compute', href: '/#compute' },
        { name: 'Storage', href: '/#storage' },
        { name: 'Networking', href: '/#networking' },
        { name: 'Security', href: '/#security' },
        { name: 'Analytics', href: '/#analytics' }
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/#about' },
        { name: 'Careers', href: '/#careers' },
        { name: 'Blog', href: '/#blog' },
        { name: 'Press', href: '/#press' },
        { name: 'Contact', href: '/#contact' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { name: 'Documentation', href: '/#docs' },
        { name: 'Tutorials', href: '/#tutorials' },
        { name: 'Support', href: '/#support' },
        { name: 'API Reference', href: '/#api' },
        { name: 'Status', href: '/#status' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/#privacy' },
        { name: 'Terms of Service', href: '/#terms' },
        { name: 'Cookie Policy', href: '/#cookies' },
        { name: 'GDPR', href: '/#gdpr' },
        { name: 'Security', href: '/#security-policy' }
      ]
    }
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <Link href="/" className={styles.footerLogo}>
              <span className={styles.logoText}>MyCloud</span>
            </Link>
            <p className={styles.tagline}>
              Enterprise cloud solutions for modern businesses
            </p>
            <div className={styles.socialLinks}>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                𝕏
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                in
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                GH
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                YT
              </a>
            </div>
          </div>

          <div className={styles.footerLinks}>
            {footerLinks.map((group) => (
              <div key={group.title} className={styles.linkGroup}>
                <h3 className={styles.groupTitle}>{group.title}</h3>
                <ul className={styles.linkList}>
                  {group.links.map((link) => (
                    <li key={link.name}>
                      <Link href={link.href} className={styles.footerLink}>
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.footerBottom}>
          <div className={styles.copyright}>
            © {currentYear} MyCloud. All rights reserved.
          </div>
          <div className={styles.footerBottomLinks}>
            <Link href="/#privacy" className={styles.footerBottomLink}>
              Privacy
            </Link>
            <Link href="/#terms" className={styles.footerBottomLink}>
              Terms
            </Link>
            <Link href="/#sitemap" className={styles.footerBottomLink}>
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 