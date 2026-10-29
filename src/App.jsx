import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowDown, ArrowLeft, ArrowRight, AudioLines, Flower2, Heart,
  LockKeyhole, Music2, Pause, Play, Sparkles, Stars, Volume2, VolumeX,
} from 'lucide-react'
import { herName, petName, yourName, introLine, memories, reasons, secrets } from './content.js'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

function SectionTitle({ eyebrow, title, description }) {
  return (
    <motion.div className="section-title" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }}>
      <span className="eyebrow"><Flower2 size={14} /> {eyebrow}</span>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </motion.div>
  )
}

function FloatingDecor() {
  return (
    <div className="floating-decor" aria-hidden="true">
      <motion.span className="decor decor-heart" animate={{ y: [0, -12, 0], rotate: [-8, 5, -8] }} transition={{ duration: 6, repeat: Infinity }}>
        <Heart fill="currentColor" />
      </motion.span>
      <motion.span className="decor decor-flower" animate={{ rotate: [0, 18, 0] }} transition={{ duration: 12, repeat: Infinity }}>
        <Flower2 />
      </motion.span>
      <motion.span className="decor decor-sparkle" animate={{ scale: [1, 1.2, 1], opacity: [0.45, 1, 0.45] }} transition={{ duration: 3.8, repeat: Infinity }}>
        <Sparkles />
      </motion.span>
    </div>
  )
}

function MusicPlayer() {
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [trackName, setTrackName] = useState('My Kind of Woman — Mac DeMarco')
  const audioRef = useRef(null)
  const inputRef = useRef(null)

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
      return
    }
    
    try {
      await audio.play()
      setPlaying(true)
    } catch {
      inputRef.current?.click()
    }
  }

  const onChooseFile = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (audioRef.current.dataset.objectUrl) URL.revokeObjectURL(audioRef.current.dataset.objectUrl)
    const objectUrl = URL.createObjectURL(file)
    audioRef.current.src = objectUrl
    audioRef.current.dataset.objectUrl = objectUrl
    setTrackName(file.name.replace(/\.[^/.]+$/, ''))
    audioRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
  }

  return (
    <div className="music-player">
      <audio
  ref={audioRef}
  src="/music/my-kind-of-woman.mp3"
  loop
  onEnded={() => setPlaying(false)}
  onPause={() => setPlaying(false)}
  onPlay={() => setPlaying(true)}/>
      <input ref={inputRef} className="visually-hidden" type="file" accept="audio/*" onChange={onChooseFile} />
      <div className="music-icon"><Music2 size={18} /></div>
      <div className="music-copy">
        <strong>{trackName}</strong>
        <span>{playing ? 'Sonando para ti' : 'Elige una canción especial'}</span>
      </div>
      <button className="icon-button" type="button" aria-label={playing ? 'Pausar música' : 'Elegir o reproducir música'} onClick={togglePlay}>
        {playing ? <Pause size={17} /> : <Play size={17} />}
      </button>
      <button className="icon-button quiet" type="button" aria-label="Elegir otra canción" onClick={() => inputRef.current?.click()}>
        <AudioLines size={17} />
      </button>
      <button className="icon-button quiet" type="button" aria-label={muted ? 'Activar sonido' : 'Silenciar'} onClick={() => {
        setMuted(!muted)
        if (audioRef.current) audioRef.current.muted = !muted
      }}>
        {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
      </button>
    </div>
  )
}

function SecretCard({ secret, index, open, onClick }) {
  return (
    <motion.button
      className={`secret-card ${open ? 'is-open' : ''}`}
      type="button"
      onClick={onClick}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: index * 0.1 }}
      aria-expanded={open}
    >
      <span className="secret-icon">{open ? <Heart fill="currentColor" size={19} /> : <LockKeyhole size={19} />}</span>
      <span className="secret-title">{secret.title}</span>
      <span className="secret-hint">{open ? 'Un secreto para ti' : 'Toca para descubrir'}</span>
      <AnimatePresence>
        {open && <motion.span className="secret-message" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35 }}>{secret.message}</motion.span>}
      </AnimatePresence>
    </motion.button>
  )
}

function MemoryCard({ memory, index }) {
  const [imageFailed, setImageFailed] = useState(false)
  return (
    <motion.article className="memory-card" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} transition={{ delay: index * 0.12 }}>
      <div className={`memory-image memory-image-${index + 1}`}>
        {!imageFailed ? (
          <img src={memory.image} alt={memory.alt} onError={() => setImageFailed(true)} />
        ) : (
          <div className="image-placeholder"><Heart size={25} /><span>Tu foto aquí</span><small>{memory.image}</small></div>
        )}
        <span className="photo-number">0{index + 1}</span>
      </div>
      <div className="memory-content">
        <span className="memory-date">{memory.date}</span>
        <h3>{memory.title}</h3>
        <p>{memory.text}</p>
      </div>
    </motion.article>
  )
}

export default function App() {
  const [started, setStarted] = useState(false)
  const [openedSecrets, setOpenedSecrets] = useState([])
  const [showLetter, setShowLetter] = useState(false)
  const [promiseAccepted, setPromiseAccepted] = useState(false)

  const revealSecret = (index) => {
    setOpenedSecrets((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index])
  }

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <main>
      <div className="topbar">
        <a className="brand" href="#inicio" aria-label="Volver al inicio"><span className="brand-mark"><Heart size={15} fill="currentColor" /></span> para {herName.toLowerCase()}</a>
        <a className="topbar-note" href="#carta">hecho con amor <Heart size={13} fill="currentColor" /></a>
      </div>

      <section className="hero" id="inicio">
        <FloatingDecor />
        <div className="hero-glow" aria-hidden="true" />
        <motion.div className="hero-content" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.16 } } }}>
          <motion.div className="hero-pill" variants={fadeUp}><Sparkles size={14} /> Un pequeño lugar para nosotros</motion.div>
          <motion.p className="script-note" variants={fadeUp}>Para ti, {petName.toLowerCase()}</motion.p>
          <motion.h1 variants={fadeUp}>Hay personas que llegan<br />y hacen <em>más bonito</em> todo.</motion.h1>
          <motion.p className="hero-description" variants={fadeUp}>{introLine} Hice este pequeño rincón pensando en ti, en nosotros y en todo lo bonito que todavía nos falta vivir.</motion.p>
          <motion.button className="primary-button" variants={fadeUp} onClick={() => { setStarted(true); scrollTo('dedicatoria') }}>
            {started ? 'Seguir descubriendo' : 'Abrir mi sorpresa'} <Heart size={17} fill="currentColor" />
          </motion.button>
          <motion.div className="hero-footnote" variants={fadeUp}><span className="tiny-heart">♡</span> Tómate tu tiempo. Todo esto es para ti.</motion.div>
        </motion.div>
        <motion.div className="hero-flower" aria-hidden="true" animate={{ y: [0, -9, 0], rotate: [-3, 2, -3] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
          <img src="/photos/flor-portada.png" alt="" onError={(e) => { e.currentTarget.style.display = 'none' }} />
          <div className="flower-fallback"><span>✿</span><small>con cariño</small></div>
        </motion.div>
        <a className="scroll-cue" href="#dedicatoria"><span>desliza despacito</span><ArrowDown size={15} /></a>
      </section>

      <section className="music-section" aria-label="Música especial">
        <MusicPlayer />
        <p>Hay canciones que se sienten como un abrazo.</p>
      </section>

      <section className="section dedication-section" id="dedicatoria">
        <SectionTitle eyebrow="Un poquito de mí para ti" title={<>Me gusta lo que somos<br /><em>cuando estamos juntos.</em></>} description="No necesito una fecha especial para recordarte lo importante que te estás volviendo para mí." />
        <div className="dedication-grid">
          <motion.div className="quote-card" initial={{ opacity: 0, rotate: -2, y: 20 }} whileInView={{ opacity: 1, rotate: 0, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <span className="quote-mark">“</span>
            <p>Contigo he aprendido que lo bonito no siempre tiene que ser enorme. A veces está en hablar un ratito más, en preguntar cómo estuvo tu día o en querer compartir contigo hasta las cosas más simples.</p>
            <div className="quote-signature"><span>con cariño,</span><strong>{yourName}</strong><Heart size={16} fill="currentColor" /></div>
          </motion.div>
          <div className="reasons-list">
            <span className="eyebrow"><Stars size={14} /> Algunas razones</span>
            {reasons.map((reason, index) => (
              <motion.div className="reason" key={reason} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <span className="reason-number">0{index + 1}</span><p>{reason}</p><Heart size={15} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="memories-section section" id="recuerdos">
        <SectionTitle eyebrow="Pequeños tesoros" title={<>Momentos que quiero<br /><em>guardar contigo.</em></>} description="Aquí van nuestros recuerdos favoritos. Los que ya tenemos y los que todavía vamos a crear." />
        <div className="memory-grid">{memories.map((memory, index) => <MemoryCard key={memory.title} memory={memory} index={index} />)}</div>
       
      </section>

      <section className="secrets-section section" id="secretos">
        <div className="secret-heading">
          <SectionTitle eyebrow="Psst… acércate" title={<>Hay cosas que quizá<br /><em>no te digo suficiente.</em></>} description="Toque cada sobrecito para abrirlo. No hay prisa, todos guardan algo bonito." />
          <motion.div className="envelope-illustration" aria-hidden="true" animate={{ y: [0, -7, 0], rotate: [2, -2, 2] }} transition={{ duration: 5, repeat: Infinity }}><span>♡</span><Heart size={48} fill="currentColor" /></motion.div>
        </div>
        <div className="secret-grid">
          {secrets.map((secret, index) => <SecretCard key={secret.title} secret={secret} index={index} open={openedSecrets.includes(index)} onClick={() => revealSecret(index)} />)}
        </div>
        <div className="secret-progress"><span className="progress-track"><span style={{ width: `${(openedSecrets.length / secrets.length) * 100}%` }} /></span><span>{openedSecrets.length} de {secrets.length} secretos descubiertos</span></div>
      </section>

      <section className="letter-section section" id="carta">
        <div className="letter-backdrop" aria-hidden="true"><span>♡</span><span>✿</span><span>♡</span></div>
        <SectionTitle eyebrow="Lo que quiero decirte" title={<>Una carta para<br /><em>mi persona favorita.</em></>} description="Hay cosas que merecen decirse sin prisa y con el corazón tranquilo." />
        {!showLetter ? (
          <motion.button className="letter-envelope" type="button" onClick={() => setShowLetter(true)} whileHover={{ y: -5 }} whileTap={{ scale: 0.98 }}>
            <span className="envelope-flap" />
            <span className="envelope-heart"><Heart fill="currentColor" size={25} /></span>
            <strong>Para {herName}</strong>
            <small>abre cuando estés lista</small>
            <span className="envelope-open"><span>Abrir carta</span><ArrowRight size={15} /></span>
          </motion.button>
        ) : (
          <motion.article className="love-letter" initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.65 }}>
            <div className="letter-top"><span>PARA {herName.toUpperCase()}</span><Heart size={18} fill="currentColor" /></div>
            <p className="letter-greeting">Mi amor,</p>
            <p>No sé exactamente en qué momento comenzaste a convertirte en alguien tan especial para mí, pero sé que desde que llegaste a mi vida hay muchas cosas que se sienten diferentes. Me gusta hablar contigo, saber cómo estuvo tu día, escuchar tus historias y encontrar cualquier excusa para compartir un ratito más contigo.</p>
            <p>Quiero que sepas que cada momento a tu lado significa mucho para mí. Me encanta tu forma de ser, tu sonrisa, tus ocurrencias y esos pequeños detalles que quizá tú no notas, pero que para mí te hacen única. No necesito que hagas algo extraordinario para hacerme feliz, muchas veces me basta con saber que estás ahí.</p>
            <p>Quiero seguir conociéndote, descubrir nuevas cosas de ti, salir juntos, reírnos por cualquier tontería, tomar fotografías que algún día nos hagan recordar lo felices que fuimos y crear recuerdos que sean solamente nuestros. Me ilusiona pensar en todo lo que todavía nos falta vivir.</p>
            <p>Y es que, Minely, no quiero que seas solamente alguien que llegó a mi vida y me hizo sentir bonito por un tiempo. Quiero que seas esa persona con la que pueda compartir mis días, mis planes, mis logros, mis abrazos y mis sueños.</p>
            <p>Por eso hoy quiero dejar de imaginar cómo sería tenerte como mi novia y preguntártelo directamente... <em>Quieres ser mi novia?</em></p>
            <p className="letter-final">Te amo muchísimo, {herName}. ♡</p>
            <div className="letter-signoff"><span>Con todo mi cariño,</span><strong>{yourName}</strong></div>
            <button className="text-button" type="button" onClick={() => setShowLetter(false)}><ArrowLeft size={14} /> Cerrar la carta por ahora</button>
          </motion.article>
        )}
      </section>

      <section className="promise-section section" id="promesa">
        <motion.div className="promise-orbit" aria-hidden="true"><span /><span /><span /><Heart fill="currentColor" /></motion.div>
        <span className="eyebrow"><Sparkles size={14} /> Y si me dejas…</span>
        <h2>No quiero prometerte<br />un cuento perfecto.<br /><em>Quiero construir algo real.</em></h2>
        <p className="promise-copy">Quiero que sigamos sumando días, aprendiendo el uno del otro, haciendo planes espontáneos y encontrando motivos para elegirnos. Que lo nuestro tenga ternura, confianza, risas y espacio para crecer.</p>
        <p className="promise-emphasis">No sé exactamente cómo será el futuro, pero me gustaría descubrirlo contigo.</p>
        {!promiseAccepted ? (
          <motion.button className="promise-button" type="button" whileHover={{ scale: 1.035 }} whileTap={{ scale: 0.98 }} onClick={() => setPromiseAccepted(true)}>
            Guardemos muchos momentos juntos <Heart size={17} fill="currentColor" />
          </motion.button>
        ) : (
          <motion.div className="promise-response" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
            <Heart size={21} fill="currentColor" /><span>Entonces, que este sea uno de muchos comienzos bonitos.</span>
          </motion.div>
        )}
        <p className="promise-signature">Para ti, {petName.toLowerCase()}. Hoy y en los días que vienen.</p>
      </section>

      <footer className="footer">
        <div className="footer-heart"><Heart size={17} fill="currentColor" /></div>
        <p>Hecho despacito, pensando en ti.</p>
        <span>{yourName} <span className="footer-dot">·</span> para {herName}</span>
        <a href="#inicio" className="back-top">volver al inicio ↑</a>
      </footer>
    </main>
  )
}