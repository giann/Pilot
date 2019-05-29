const Tone = require('tone')

import ChannelInterface from './interface.channel.js'
import EffectInterface from './interface.effect.js'
import ChannelEffectInterface from './interface.channel.effect.js'

const EFFECTS = ['bit', 'dis', 'wah', 'che', 'fee', 'del', 'tre', 'rev', 'pha', 'vib', 'cho', 'ste', 'equ', 'com', 'vol', 'lim']

const getEffect = function(type) {
  switch(type) {
    case 'bit':
      return new Tone.BitCrusher(4)
    case 'dis':
      return new Tone.Distortion(0.05)
    case 'wah':
      return new Tone.AutoWah(100, 6, 0)
    case 'che':
      return new Tone.Chebyshev(50)
    case 'fee':
      return new Tone.FeedbackDelay(0)
    case 'del':
      return new Tone.PingPongDelay('4n', 0.2)
    case 'tre':
      return new Tone.Tremolo()
    case 'rev':
      return new Tone.JCReverb(0)
    case 'pha':
      return new Tone.Phaser(0.5, 3, 350)
    case 'vib':
      return new Tone.Vibrato()
    case 'cho':
      return new Tone.Chorus(4, 2.5, 0.5)
    case 'ste':
      return new Tone.StereoWidener(0.5, 3, 350)
    case 'equ':
      return new Tone.EQ3(5, 0, 5)
    case 'com':
      return new Tone.Compressor(-6, 4)
    case 'vol':
      return new Tone.Volume(6)
    case 'lim':
      return new Tone.Limiter(-2)
  }

  console.warn('Unknown effect', type)

  return null
}

export default function Mixer (pilot) {
  this.el = document.createElement('div')
  this.el.id = 'mixer'

  this.channels = []
  this.channelsEffects = []
  this.effects = {}

  this.install = function (host) {
    console.log('Mixer', 'Installing..')

    Tone.start()
    Tone.Transport.start()

    // AM
    this.channels[0] = new ChannelInterface(pilot, 0, new Tone.AMSynth({ 'harmonicity': 1.25, 'oscillator': { 'type': 'sine8' }, 'modulation': { 'type': 'sine' } }))
    this.channels[1] = new ChannelInterface(pilot, 1, new Tone.AMSynth({ 'harmonicity': 1.5, 'oscillator': { 'type': 'triangle8' }, 'modulation': { 'type': 'sawtooth' } }))
    this.channels[2] = new ChannelInterface(pilot, 2, new Tone.AMSynth({ 'harmonicity': 1.75, 'oscillator': { 'type': 'sawtooth8' }, 'modulation': { 'type': 'triangle' } }))
    this.channels[3] = new ChannelInterface(pilot, 3, new Tone.AMSynth({ 'harmonicity': 2, 'oscillator': { 'type': 'square8' }, 'modulation': { 'type': 'square' } }))
    // AM
    this.channels[4] = new ChannelInterface(pilot, 4, new Tone.AMSynth({ 'harmonicity': 1.25, 'oscillator': { 'type': 'sine4' }, 'modulation': { 'type': 'square8' } }))
    this.channels[5] = new ChannelInterface(pilot, 5, new Tone.AMSynth({ 'harmonicity': 1.5, 'oscillator': { 'type': 'triangle4' }, 'modulation': { 'type': 'sawtooth8' } }))
    this.channels[6] = new ChannelInterface(pilot, 6, new Tone.FMSynth({ 'harmonicity': 1.75, 'modulationIndex': 10, 'oscillator': { 'type': 'sawtooth4' }, 'modulation': { 'type': 'triangle8' } }))
    this.channels[7] = new ChannelInterface(pilot, 7, new Tone.FMSynth({ 'harmonicity': 2, 'modulationIndex': 20, 'oscillator': { 'type': 'square4' }, 'modulation': { 'type': 'sine8' } }))
    // FM
    this.channels[8] = new ChannelInterface(pilot, 8, new Tone.FMSynth({ 'harmonicity': 0.5, 'modulationIndex': 30, 'oscillator': { 'type': 'sine' }, 'modulation': { 'type': 'sawtooth4' } }))
    this.channels[9] = new ChannelInterface(pilot, 9, new Tone.FMSynth({ 'harmonicity': 2.5, 'modulationIndex': 40, 'oscillator': { 'type': 'sine' }, 'modulation': { 'type': 'triangle8' } }))
    this.channels[10] = new ChannelInterface(pilot, 10, new Tone.MonoSynth({ 'volume': -20, oscillator: { 'type': 'sawtooth4' } }))
    this.channels[11] = new ChannelInterface(pilot, 11, new Tone.MonoSynth({ 'volume': -20, oscillator: { 'type': 'sine4' } }))
    // Membrane
    this.channels[12] = new ChannelInterface(pilot, 12, new Tone.MembraneSynth({ 'octaves': 5, 'oscillator': { 'type': 'sine' } }))
    this.channels[13] = new ChannelInterface(pilot, 13, new Tone.MembraneSynth({ 'octaves': 10, 'oscillator': { 'type': 'sawtooth' } }))
    this.channels[14] = new ChannelInterface(pilot, 14, new Tone.MembraneSynth({ 'octaves': 15, 'oscillator': { 'type': 'triangle' } }))
    this.channels[15] = new ChannelInterface(pilot, 15, new Tone.MembraneSynth({ 'octaves': 20, 'oscillator': { 'type': 'square' } }))

    // One FX slot (default rev) for each channel
    for (const id in this.channels) {
      this.channelsEffects[id] = new ChannelEffectInterface(pilot, id, 'rev', getEffect('rev'))
    }

    // I
    this.effects.bitcrusher = new EffectInterface(pilot, 'bit', getEffect('bit'))
    this.effects.distortion = new EffectInterface(pilot, 'dis', getEffect('dis'))
    this.effects.autowah    = new EffectInterface(pilot, 'wah', getEffect('wah'))
    this.effects.chebyshev  = new EffectInterface(pilot, 'che', getEffect('che'))
    // II
    this.effects.feedback   = new EffectInterface(pilot, 'fee', getEffect('fee'))
    this.effects.delay      = new EffectInterface(pilot, 'del', getEffect('del'))
    this.effects.tremolo    = new EffectInterface(pilot, 'tre', getEffect('tre'))
    this.effects.reverb     = new EffectInterface(pilot, 'rev', getEffect('rev'))
    // III
    this.effects.phaser     = new EffectInterface(pilot, 'pha', getEffect('pha'))
    this.effects.vibrato    = new EffectInterface(pilot, 'vib', getEffect('vib'))
    this.effects.chorus     = new EffectInterface(pilot, 'cho', getEffect('cho'))
    this.effects.widener    = new EffectInterface(pilot, 'ste', getEffect('ste'))
    // Mastering
    this.effects.equalizer  = new EffectInterface(pilot, 'equ', getEffect('equ'))
    this.effects.compressor = new EffectInterface(pilot, 'com', getEffect('com'))
    this.effects.volume     = new EffectInterface(pilot, 'vol', getEffect('vol'))
    this.effects.limiter    = new EffectInterface(pilot, 'lim', getEffect('lim'))

    // Connect
    for (const id in this.channels) {
      this.channels[id].connect(this.channelsEffects[id].node)

      this.channelsEffects[id].node.connect(this.effects.bitcrusher.node)
    }

    this.effects.bitcrusher.connect(this.effects.distortion.node)
    this.effects.distortion.connect(this.effects.autowah.node)
    this.effects.autowah.connect(this.effects.chebyshev.node)
    this.effects.chebyshev.connect(this.effects.feedback.node)

    this.effects.feedback.connect(this.effects.delay.node)
    this.effects.delay.connect(this.effects.tremolo.node)
    this.effects.tremolo.connect(this.effects.reverb.node)
    this.effects.reverb.connect(this.effects.phaser.node)

    this.effects.phaser.connect(this.effects.vibrato.node)
    this.effects.vibrato.connect(this.effects.chorus.node)
    this.effects.chorus.connect(this.effects.widener.node)
    this.effects.widener.connect(this.effects.equalizer.node)

    this.effects.equalizer.connect(this.effects.compressor.node)
    this.effects.compressor.connect(this.effects.volume.node)
    this.effects.volume.connect(this.effects.limiter.node)

    // Add all instruments to dom
    for (const id in this.channels) {
      this.channels[id].install(this.el)

      this.channelsEffects[id].install(this.el)
    }

    // Add all effects to dom
    for (const id in this.effects) {
      this.effects[id].install(this.el)
    }

    host.appendChild(this.el)
  }

  this.start = function () {
    console.log('Synthetiser', 'Starting..')
    for (const id in this.channels) {
      this.channels[id].start()
      this.channelsEffects[id].start()
    }
    for (const id in this.effects) {
      this.effects[id].start()
    }

    // Create Env Presets
    for (const id in this.channels) {
      this.channels[id].setEnv({ isEnv: true,
        attack: 0.001,
        decay: clamp(((8 - (id % 8)) / 8), 0.01, 0.9),
        sustain: clamp(((id % 4) / 4), 0.01, 0.9),
        release: clamp(((id % 6) / 6), 0.01, 0.9)
      })
    }

    this.setSpeed(120)
    setTimeout(() => { this.effects.limiter.node.toMaster() },2000)
    this.run()
  }

  this.run = function (msg) {
    // Multi
    if (`${msg}`.indexOf(';') > -1) {
      const parts = `${msg}`.split(';')
      for (const id in parts) {
        this.run(parts[id])
      }
      return
    }
    // Single
    for (const id in this.channels) {
      this.channels[id].run(msg)

      // Channel effect might have changed
      if (msg && `${msg}`.substr(0, 1).toLowerCase() === id.toString(16)) {
        let effect = `${msg}`.substr(1, 3).toLowerCase()
        let channel = this.channels[id]
        let channelEffect = this.channelsEffects[id]

        if (EFFECTS.indexOf(effect) > -1 && effect !== channelEffect.effectId) {
          let newEffect = getEffect(effect)

          if (newEffect) {
            // Remove current effect
            this.channelsEffects[id].stop()
            this.channelsEffects[id].uninstall()
            this.channelsEffects[id].disconnect()  

            // Install new one
            this.channelsEffects[id] = new ChannelEffectInterface(pilot, id, effect, newEffect)
            this.channelsEffects[id].install(this.el)
            this.channelsEffects[id].start()

            // Put back in circuit
            this.channels[id].connect(this.channelsEffects[id].node)
            this.channelsEffects[id].node.connect(this.effects.bitcrusher.node)
          }
        }
      } 

      this.channelsEffects[id].run(msg)
    }
    for (const id in this.effects) {
      this.effects[id].run(msg)
    }
    // Special
    if (msg && `${msg}`.substr(0, 3).toLowerCase() === 'bpm') {
      this.setSpeed(msg.substr(3))
    }
    // Special
    if (msg && `${msg}`.substr(0, 4).toLowerCase() === 'renv') {
      for (const id in this.channels) {
        this.channels[id].randEnv()
      }
    }
    if (msg && `${msg}`.substr(0, 4).toLowerCase() === 'rosc') {
      for (const id in this.channels) {
        this.channels[id].randOsc()
      }
    }
    if (msg && `${msg}`.substr(0, 4).toLowerCase() === 'refx') {
      for (const id in this.effects) {
        this.effects[id].rand(msg)
      }
    }
  }

  this.setSpeed = function (bpm) {
    if (parseInt(bpm) < 30) { return }
    Tone.Transport.bpm.rampTo(parseInt(bpm), 4)
    console.log(`Changed BPM to ${bpm}.`)
    pilot.recorder.el.innerHTML = `${bpm}`
  }

  function clamp (v, min, max) { return v < min ? min : v > max ? max : v }
}
