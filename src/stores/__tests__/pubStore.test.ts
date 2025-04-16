import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePubStore } from '../pubStore'
import { Pub, toPubId, toLocationTypeId } from '../../types'

describe('pubStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with empty pubs array', () => {
    const store = usePubStore()
    expect(store.pubs).toEqual([])
  })

  it('should set pubs', () => {
    const store = usePubStore()
    const testPubs: Pub[] = [
      {
        id: toPubId('1'),
        name: 'Test Pub 1',
        lat: 51.5074,
        lng: -0.1278,
        locationType: toLocationTypeId('market'),
        scouted: false
      },
      {
        id: toPubId('2'),
        name: 'Test Pub 2',
        lat: 51.5075,
        lng: -0.1279,
        locationType: toLocationTypeId('market'),
        scouted: false
      }
    ]

    store.setPubs(testPubs)
    expect(store.pubs).toEqual(testPubs)
  })

  it('should find pub by ID', () => {
    const store = usePubStore()
    const testPubs: Pub[] = [
      {
        id: toPubId('1'),
        name: 'Test Pub 1',
        lat: 51.5074,
        lng: -0.1278,
        locationType: toLocationTypeId('market'),
        scouted: false
      }
    ]

    store.setPubs(testPubs)
    const foundPub = store.pub(toPubId('1'))
    expect(foundPub).toEqual(testPubs[0])
  })

  it('should throw error when pub not found', () => {
    const store = usePubStore()
    expect(() => store.pub(toPubId('nonexistent'))).toThrow('Pub with ID nonexistent not found')
  })
}) 