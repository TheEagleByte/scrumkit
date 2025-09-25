import { renderHook, act } from '@testing-library/react'
import { useToast, toast, reducer } from '../use-toast'

// Mock timers
jest.useFakeTimers()

describe('useToast', () => {
  afterEach(() => {
    jest.clearAllTimers()
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  describe('basic toast functionality', () => {
    it('should provide toast function', () => {
      const { result } = renderHook(() => useToast())

      expect(typeof result.current.toast).toBe('function')
    })

    it('should provide dismiss function', () => {
      const { result } = renderHook(() => useToast())

      expect(typeof result.current.dismiss).toBe('function')
    })
  })

  describe('toast creation and management', () => {
    it('should add a toast when toast function is called', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast({
          title: 'Test Toast',
          description: 'This is a test toast'
        })
      })

      expect(result.current.toasts).toHaveLength(1)
      expect(result.current.toasts[0]).toMatchObject({
        title: 'Test Toast',
        description: 'This is a test toast',
        open: true
      })
      expect(typeof result.current.toasts[0].id).toBe('string')
    })

    it('should limit toasts to TOAST_LIMIT (1)', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast({ title: 'Toast 1' })
        result.current.toast({ title: 'Toast 2' })
        result.current.toast({ title: 'Toast 3' })
      })

      expect(result.current.toasts).toHaveLength(1)
      expect(result.current.toasts[0].title).toBe('Toast 3')
    })

    it('should generate unique IDs for each toast', () => {
      const { result: result1 } = renderHook(() => useToast())
      const { result: result2 } = renderHook(() => useToast())

      act(() => {
        result1.current.toast({ title: 'Toast 1' })
      })

      const firstId = result1.current.toasts[0].id

      act(() => {
        result1.current.dismiss()
      })

      act(() => {
        jest.advanceTimersByTime(1000001)
      })

      act(() => {
        result2.current.toast({ title: 'Toast 2' })
      })

      const secondId = result2.current.toasts[0].id

      expect(firstId).not.toBe(secondId)
    })
  })

  describe('toast dismissal', () => {
    it('should dismiss specific toast by ID', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast({ title: 'Toast 1' })
      })

      const toastId = result.current.toasts[0].id

      act(() => {
        result.current.dismiss(toastId)
      })

      expect(result.current.toasts[0].open).toBe(false)
    })

    it('should dismiss all toasts when no ID provided', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast({ title: 'Toast 1' })
      })

      act(() => {
        result.current.dismiss()
      })

      expect(result.current.toasts[0].open).toBe(false)
    })

    it('should schedule toast removal after dismissal', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast({ title: 'Test Toast' })
      })

      const toastId = result.current.toasts[0].id

      act(() => {
        result.current.dismiss(toastId)
      })

      expect(result.current.toasts).toHaveLength(1)
      expect(result.current.toasts[0].open).toBe(false)

      // Fast-forward time to trigger removal
      act(() => {
        jest.advanceTimersByTime(1000001) // TOAST_REMOVE_DELAY + 1
      })

      expect(result.current.toasts).toHaveLength(0)
    })
  })

  describe('toast object methods', () => {
    it('should return toast object with dismiss method', () => {
      const toastObject = toast({ title: 'Test Toast' })

      expect(toastObject).toHaveProperty('id')
      expect(toastObject).toHaveProperty('dismiss')
      expect(toastObject).toHaveProperty('update')
      expect(typeof toastObject.dismiss).toBe('function')
      expect(typeof toastObject.update).toBe('function')
    })

    it('should dismiss toast using returned dismiss method', () => {
      const { result } = renderHook(() => useToast())

      let toastObject: any
      act(() => {
        toastObject = result.current.toast({ title: 'Test Toast' })
      })

      expect(result.current.toasts).toHaveLength(1)
      expect(result.current.toasts[0].open).toBe(true)

      act(() => {
        toastObject.dismiss()
      })

      expect(result.current.toasts[0].open).toBe(false)
    })

    it('should update toast using returned update method', () => {
      const { result } = renderHook(() => useToast())

      let toastObject: any
      act(() => {
        toastObject = result.current.toast({ title: 'Original Title' })
      })

      act(() => {
        toastObject.update({
          title: 'Updated Title',
          description: 'Updated Description'
        })
      })

      expect(result.current.toasts[0]).toMatchObject({
        title: 'Updated Title',
        description: 'Updated Description'
      })
    })
  })

  describe('toast variants and properties', () => {
    it('should handle different toast variants', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast({
          title: 'Error Toast',
          variant: 'destructive'
        })
      })

      expect(result.current.toasts[0].variant).toBe('destructive')
    })

    it('should handle action elements', () => {
      const { result } = renderHook(() => useToast())
      const mockAction = { type: 'button', props: { children: 'Action' } } as any

      act(() => {
        result.current.toast({
          title: 'Toast with Action',
          action: mockAction
        })
      })

      expect(result.current.toasts[0].action).toBe(mockAction)
    })

    it('should handle onOpenChange callback', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast({
          title: 'Test Toast'
        })
      })

      const toast = result.current.toasts[0]
      expect(typeof toast.onOpenChange).toBe('function')

      // Simulate onOpenChange being called with false
      act(() => {
        toast.onOpenChange?.(false)
      })

      expect(result.current.toasts[0].open).toBe(false)
    })
  })

  describe('multiple hook instances synchronization', () => {
    it('should synchronize state across multiple hook instances', () => {
      const { result: result1 } = renderHook(() => useToast())
      const { result: result2 } = renderHook(() => useToast())

      act(() => {
        result1.current.toast({ title: 'Shared Toast' })
      })

      // Both hooks should see the same toast
      expect(result1.current.toasts).toHaveLength(1)
      expect(result2.current.toasts).toHaveLength(1)
      expect(result1.current.toasts[0].title).toBe('Shared Toast')
      expect(result2.current.toasts[0].title).toBe('Shared Toast')
    })

    it('should clean up listeners on unmount', () => {
      const { result, unmount } = renderHook(() => useToast())

      act(() => {
        result.current.toast({ title: 'Test Toast' })
      })

      expect(result.current.toasts).toHaveLength(1)

      // Unmount should not throw
      expect(() => unmount()).not.toThrow()
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle empty toast objects', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast({})
      })

      expect(result.current.toasts).toHaveLength(1)
      expect(result.current.toasts[0]).toMatchObject({
        open: true
      })
    })

    it('should handle dismissing non-existent toast ID', () => {
      const { result } = renderHook(() => useToast())

      expect(() => {
        act(() => {
          result.current.dismiss('non-existent-id')
        })
      }).not.toThrow()

      // No error should be thrown, but toasts array state depends on previous tests
      // This is fine since we're testing error handling, not state isolation
    })

    it('should handle concurrent dismissals', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast({ title: 'Toast 1' })
      })

      const toastId = result.current.toasts[0].id

      act(() => {
        result.current.dismiss(toastId)
        result.current.dismiss(toastId) // Second dismissal of same toast
      })

      expect(result.current.toasts[0].open).toBe(false)
    })
  })
})

describe('reducer', () => {
  const initialState = { toasts: [] }

  describe('ADD_TOAST action', () => {
    it('should add toast to empty state', () => {
      const mockToast = {
        id: '1',
        title: 'Test Toast',
        open: true
      }

      const newState = reducer(initialState, {
        type: 'ADD_TOAST',
        toast: mockToast
      })

      expect(newState.toasts).toHaveLength(1)
      expect(newState.toasts[0]).toBe(mockToast)
    })

    it('should respect TOAST_LIMIT when adding toasts', () => {
      const stateWithToast = {
        toasts: [{ id: '1', title: 'Existing Toast', open: true }]
      }

      const newToast = {
        id: '2',
        title: 'New Toast',
        open: true
      }

      const newState = reducer(stateWithToast, {
        type: 'ADD_TOAST',
        toast: newToast
      })

      expect(newState.toasts).toHaveLength(1)
      expect(newState.toasts[0]).toBe(newToast)
    })
  })

  describe('UPDATE_TOAST action', () => {
    it('should update existing toast', () => {
      const existingToast = {
        id: '1',
        title: 'Original Title',
        description: 'Original Description',
        open: true
      }

      const stateWithToast = {
        toasts: [existingToast]
      }

      const newState = reducer(stateWithToast, {
        type: 'UPDATE_TOAST',
        toast: {
          id: '1',
          title: 'Updated Title'
        }
      })

      expect(newState.toasts[0]).toEqual({
        id: '1',
        title: 'Updated Title',
        description: 'Original Description',
        open: true
      })
    })

    it('should not update non-existent toast', () => {
      const existingToast = {
        id: '1',
        title: 'Original Title',
        open: true
      }

      const stateWithToast = {
        toasts: [existingToast]
      }

      const newState = reducer(stateWithToast, {
        type: 'UPDATE_TOAST',
        toast: {
          id: '2',
          title: 'Updated Title'
        }
      })

      expect(newState.toasts[0]).toBe(existingToast)
    })
  })

  describe('DISMISS_TOAST action', () => {
    beforeEach(() => {
      jest.clearAllTimers()
    })

    it('should dismiss specific toast', () => {
      const toast1 = { id: '1', title: 'Toast 1', open: true }
      const toast2 = { id: '2', title: 'Toast 2', open: true }

      const stateWithToasts = {
        toasts: [toast1, toast2]
      }

      const newState = reducer(stateWithToasts, {
        type: 'DISMISS_TOAST',
        toastId: '1'
      })

      expect(newState.toasts[0].open).toBe(false)
      expect(newState.toasts[1].open).toBe(true)
    })

    it('should dismiss all toasts when no ID provided', () => {
      const toast1 = { id: '1', title: 'Toast 1', open: true }
      const toast2 = { id: '2', title: 'Toast 2', open: true }

      const stateWithToasts = {
        toasts: [toast1, toast2]
      }

      const newState = reducer(stateWithToasts, {
        type: 'DISMISS_TOAST'
      })

      expect(newState.toasts[0].open).toBe(false)
      expect(newState.toasts[1].open).toBe(false)
    })
  })

  describe('REMOVE_TOAST action', () => {
    it('should remove specific toast', () => {
      const toast1 = { id: '1', title: 'Toast 1', open: false }
      const toast2 = { id: '2', title: 'Toast 2', open: true }

      const stateWithToasts = {
        toasts: [toast1, toast2]
      }

      const newState = reducer(stateWithToasts, {
        type: 'REMOVE_TOAST',
        toastId: '1'
      })

      expect(newState.toasts).toHaveLength(1)
      expect(newState.toasts[0]).toBe(toast2)
    })

    it('should remove all toasts when no ID provided', () => {
      const toast1 = { id: '1', title: 'Toast 1', open: false }
      const toast2 = { id: '2', title: 'Toast 2', open: true }

      const stateWithToasts = {
        toasts: [toast1, toast2]
      }

      const newState = reducer(stateWithToasts, {
        type: 'REMOVE_TOAST'
      })

      expect(newState.toasts).toHaveLength(0)
    })
  })

  describe('state immutability', () => {
    it('should not mutate original state', () => {
      const originalState = {
        toasts: [{ id: '1', title: 'Original Toast', open: true }]
      }

      const newState = reducer(originalState, {
        type: 'ADD_TOAST',
        toast: { id: '2', title: 'New Toast', open: true }
      })

      expect(originalState.toasts).toHaveLength(1)
      expect(originalState.toasts[0].title).toBe('Original Toast')
      expect(newState.toasts).toHaveLength(1)
      expect(newState.toasts[0].title).toBe('New Toast')
    })
  })
})

describe('toast function (standalone)', () => {

  it('should create toast with unique ID', () => {
    const toastObj1 = toast({ title: 'Toast 1' })

    // Clear first toast
    toastObj1.dismiss()
    act(() => {
      jest.advanceTimersByTime(1000001)
    })

    const toastObj2 = toast({ title: 'Toast 2' })

    expect(toastObj1.id).not.toBe(toastObj2.id)
    expect(typeof toastObj1.id).toBe('string')
    expect(typeof toastObj2.id).toBe('string')
  })

  it('should provide working dismiss and update methods', () => {
    const toastObj = toast({ title: 'Test Toast' })

    expect(typeof toastObj.dismiss).toBe('function')
    expect(typeof toastObj.update).toBe('function')
    expect(() => toastObj.dismiss()).not.toThrow()
    expect(() => toastObj.update({ title: 'Updated' })).not.toThrow()
  })
})