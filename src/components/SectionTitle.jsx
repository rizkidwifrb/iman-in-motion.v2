export default function SectionTitle({ eyebrow, title, description, centered = false }) {
  return (
    <div className={`mb-8 ${centered ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}`}>
      {eyebrow && <p className="section-eyebrow">{eyebrow}</p>}
      <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-iim-coffee dark:text-iim-cream md:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-base leading-8 text-iim-brown dark:text-iim-sand">{description}</p>}
    </div>
  );
}
