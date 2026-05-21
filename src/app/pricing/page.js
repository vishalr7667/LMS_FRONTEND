'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './pricing.module.css';

const PLANS = [
  {
    name: 'Free', desc: 'Get started with free courses and resources.', price: 0, period: '',
    features: [
      { text: 'Access to all free courses', included: true },
      { text: 'Basic resource downloads', included: true },
      { text: 'Community access', included: true },
      { text: 'Progress tracking', included: true },
      { text: 'Premium courses', included: false },
      { text: 'Premium resources', included: false },
      { text: 'Certificate of completion', included: false },
    ]
  },
  {
    name: 'Pro', desc: 'Full access to all courses and premium content.', price: 19.99, period: '/month', popular: true,
    features: [
      { text: 'Everything in Free', included: true },
      { text: 'All premium courses', included: true },
      { text: 'All premium resources', included: true },
      { text: 'Certificate of completion', included: true },
      { text: 'Priority support', included: true },
      { text: 'Early access to new content', included: true },
      { text: 'Downloadable project files', included: true },
    ]
  },
  {
    name: 'Lifetime', desc: 'One-time payment, learn forever.', price: 299, period: 'one-time',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Lifetime access', included: true },
      { text: 'All future courses included', included: true },
      { text: 'Exclusive community access', included: true },
      { text: 'Direct instructor support', included: true },
      { text: 'Behind-the-scenes content', included: true },
      { text: 'Best value — pay once', included: true },
    ]
  }
];

const FAQS = [
  { q: 'Can I try before I buy?', a: 'Many of our courses have free preview lessons that you can watch without a subscription. Plus, we offer a full 14-day money-back guarantee on all paid plans.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, PayPal, and regional payment methods through our payment processor FastSpring.' },
  { q: 'Can I cancel my subscription anytime?', a: 'Yes! You can cancel anytime from your account settings. You will continue to have access until the end of your billing period.' },
  { q: 'Do I get a certificate?', a: 'Yes, Pro and Lifetime subscribers receive a certificate of completion for each course they finish.' },
  { q: 'How is the Lifetime plan different from Pro?', a: 'The Lifetime plan is a one-time payment that gives you access to all current and future courses forever. No recurring charges!' },
];

function PricingContent() {
  const [openFAQ, setOpenFAQ] = useState(null);

  return (
    <>
        <div className="container">
          <div className={styles.pricingPage}>
            <div className={styles.pricingHeader}>
              <h1 className={styles.pricingTitle}>
                Simple, <span className="text-gold">Transparent</span> Pricing
              </h1>
              <p className={styles.pricingSubtitle}>
                Choose the plan that&apos;s right for you. Start free, upgrade anytime.
              </p>
            </div>

            <div className={styles.plansGrid}>
              {PLANS.map((plan, i) => (
                <div
                  key={i}
                  className={`${styles.planCard} ${plan.popular ? styles.planCardPopular : ''}`}
                >
                  <h3 className={styles.planName}>{plan.name}</h3>
                  <p className={styles.planDesc}>{plan.desc}</p>
                  <div className={styles.planPrice}>
                    {plan.price === 0 ? (
                      <span className={styles.planFree}>Free</span>
                    ) : (
                      <>
                        <span className={styles.planCurrency}>$</span>
                        <span className={styles.planAmount}>{plan.price}</span>
                        <span className={styles.planPeriod}>{plan.period}</span>
                      </>
                    )}
                  </div>
                  <div className={styles.planFeatures}>
                    {plan.features.map((f, j) => (
                      <div key={j} className={`${styles.planFeature} ${!f.included ? styles.planFeatureDisabled : ''}`}>
                        <span className={styles.planFeatureIcon}>{f.included ? '✓' : '✕'}</span>
                        <span>{f.text}</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/auth/register"
                    className={`btn ${plan.popular ? 'btn-primary' : 'btn-dark'} btn-lg`}
                    style={{ width: '100%' }}
                  >
                    {plan.price === 0 ? 'Get Started Free' : `Choose ${plan.name}`}
                  </Link>
                </div>
              ))}
            </div>

            <div className={styles.faqSection}>
              <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
              {FAQS.map((faq, i) => (
                <div key={i} className={styles.faqItem}>
                  <div className={styles.faqQuestion} onClick={() => setOpenFAQ(openFAQ === i ? null : i)}>
                    <span>{faq.q}</span>
                    <span className={`${styles.faqToggle} ${openFAQ === i ? styles.faqToggleOpen : ''}`}>+</span>
                  </div>
                  {openFAQ === i && (
                    <div className={styles.faqAnswer}>{faq.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
    </>
  );
}

export default function PricingPage() {
  return <PricingContent />;
}
