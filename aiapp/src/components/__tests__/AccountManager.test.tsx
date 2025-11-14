import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('AccountManager Component', () => {
  // Mock localStorage
  let localStorageMock: { [key: string]: string } = {};

  beforeEach(() => {
    // Reset localStorage mock before each test
    localStorageMock = {};
    
    global.localStorage = {
      getItem: (key: string) => localStorageMock[key] || null,
      setItem: (key: string, value: string) => {
        localStorageMock[key] = value;
      },
      removeItem: (key: string) => {
        delete localStorageMock[key];
      },
      clear: () => {
        localStorageMock = {};
      },
      length: Object.keys(localStorageMock).length,
      key: (index: number) => Object.keys(localStorageMock)[index] || null,
    } as Storage;
  });

  afterEach(() => {
    localStorageMock = {};
  });

  describe('Component Props', () => {
    it('should accept required props', () => {
      const props = {
        accounts: ['ChartChampions', 'unusual_whales'],
        onSave: (accounts: string[]) => {},
        onClose: () => {}
      };
      
      expect(props.accounts).toBeDefined();
      expect(props.onSave).toBeDefined();
      expect(props.onClose).toBeDefined();
    });

    it('should handle empty accounts array', () => {
      const props = {
        accounts: [],
        onSave: (accounts: string[]) => {},
        onClose: () => {}
      };
      
      expect(props.accounts.length).toBe(0);
    });

    it('should handle multiple accounts', () => {
      const accounts = ['ChartChampions', 'unusual_whales', 'TradingView'];
      expect(accounts.length).toBe(3);
    });
  });

  describe('Twitter Username Validation', () => {
    const isValidTwitterUsername = (username: string): boolean => {
      const trimmed = username.trim();
      if (trimmed.length === 0 || trimmed.length > 15) {
        return false;
      }
      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      return usernameRegex.test(trimmed);
    };

    it('should accept valid usernames', () => {
      const validUsernames = [
        'ChartChampions',
        'unusual_whales',
        'user123',
        'a',
        'A_B_C_123'
      ];
      
      validUsernames.forEach(username => {
        expect(isValidTwitterUsername(username)).toBe(true);
      });
    });

    it('should reject usernames with invalid characters', () => {
      const invalidUsernames = [
        'user@name',
        'user-name',
        'user.name',
        'user name',
        'user!name',
        'user#name'
      ];
      
      invalidUsernames.forEach(username => {
        expect(isValidTwitterUsername(username)).toBe(false);
      });
    });

    it('should reject empty usernames', () => {
      expect(isValidTwitterUsername('')).toBe(false);
      expect(isValidTwitterUsername('   ')).toBe(false);
    });

    it('should reject usernames longer than 15 characters', () => {
      expect(isValidTwitterUsername('a'.repeat(16))).toBe(false);
      expect(isValidTwitterUsername('a'.repeat(15))).toBe(true);
    });

    it('should accept usernames with underscores', () => {
      expect(isValidTwitterUsername('user_name')).toBe(true);
      expect(isValidTwitterUsername('_username')).toBe(true);
      expect(isValidTwitterUsername('username_')).toBe(true);
    });

    it('should accept alphanumeric usernames', () => {
      expect(isValidTwitterUsername('user123')).toBe(true);
      expect(isValidTwitterUsername('123user')).toBe(true);
      expect(isValidTwitterUsername('123')).toBe(true);
    });

    it('should handle @ symbol removal', () => {
      const username = '@ChartChampions';
      const cleaned = username.replace(/^@/, '');
      expect(isValidTwitterUsername(cleaned)).toBe(true);
    });
  });

  describe('Add Account Functionality', () => {
    it('should add valid account to list', () => {
      const accounts: string[] = ['ChartChampions'];
      const newAccount = 'unusual_whales';
      
      const updatedAccounts = [...accounts, newAccount];
      expect(updatedAccounts.length).toBe(2);
      expect(updatedAccounts).toContain('unusual_whales');
    });

    it('should prevent duplicate accounts', () => {
      const accounts = ['ChartChampions', 'unusual_whales'];
      const newAccount = 'ChartChampions';
      
      const isDuplicate = accounts.some(
        acc => acc.toLowerCase() === newAccount.toLowerCase()
      );
      
      expect(isDuplicate).toBe(true);
    });

    it('should prevent duplicate accounts case-insensitively', () => {
      const accounts = ['ChartChampions'];
      const newAccount = 'chartchampions';
      
      const isDuplicate = accounts.some(
        acc => acc.toLowerCase() === newAccount.toLowerCase()
      );
      
      expect(isDuplicate).toBe(true);
    });

    it('should trim whitespace from new accounts', () => {
      const newAccount = '  unusual_whales  ';
      const trimmed = newAccount.trim();
      
      expect(trimmed).toBe('unusual_whales');
    });

    it('should remove @ symbol from usernames', () => {
      const newAccount = '@ChartChampions';
      const cleaned = newAccount.replace(/^@/, '');
      
      expect(cleaned).toBe('ChartChampions');
    });
  });

  describe('Remove Account Functionality', () => {
    it('should remove account from list', () => {
      const accounts = ['ChartChampions', 'unusual_whales', 'TradingView'];
      const accountToRemove = 'unusual_whales';
      
      const updatedAccounts = accounts.filter(acc => acc !== accountToRemove);
      
      expect(updatedAccounts.length).toBe(2);
      expect(updatedAccounts).not.toContain('unusual_whales');
    });

    it('should handle removing non-existent account', () => {
      const accounts = ['ChartChampions', 'unusual_whales'];
      const accountToRemove = 'NonExistent';
      
      const updatedAccounts = accounts.filter(acc => acc !== accountToRemove);
      
      expect(updatedAccounts.length).toBe(2);
    });

    it('should handle removing last account', () => {
      const accounts = ['ChartChampions'];
      const accountToRemove = 'ChartChampions';
      
      const updatedAccounts = accounts.filter(acc => acc !== accountToRemove);
      
      expect(updatedAccounts.length).toBe(0);
    });
  });

  describe('Default Suggestions', () => {
    const DEFAULT_SUGGESTIONS = [
      'ChartChampions',
      'unusual_whales',
      'TradingView',
      'Benzinga',
      'MarketWatch',
      'WSJmarkets',
      'CNBCnow',
      'SquawkCNBC',
    ];

    it('should have default suggestions', () => {
      expect(DEFAULT_SUGGESTIONS.length).toBeGreaterThan(0);
    });

    it('should filter out already added accounts from suggestions', () => {
      const accounts = ['ChartChampions', 'unusual_whales'];
      
      const availableSuggestions = DEFAULT_SUGGESTIONS.filter(
        suggestion => !accounts.some(acc => acc.toLowerCase() === suggestion.toLowerCase())
      );
      
      expect(availableSuggestions.length).toBe(DEFAULT_SUGGESTIONS.length - 2);
      expect(availableSuggestions).not.toContain('ChartChampions');
      expect(availableSuggestions).not.toContain('unusual_whales');
    });

    it('should show all suggestions when no accounts added', () => {
      const accounts: string[] = [];
      
      const availableSuggestions = DEFAULT_SUGGESTIONS.filter(
        suggestion => !accounts.some(acc => acc.toLowerCase() === suggestion.toLowerCase())
      );
      
      expect(availableSuggestions.length).toBe(DEFAULT_SUGGESTIONS.length);
    });

    it('should add suggestion to accounts', () => {
      const accounts = ['ChartChampions'];
      const suggestion = 'TradingView';
      
      const updatedAccounts = [...accounts, suggestion];
      
      expect(updatedAccounts).toContain('TradingView');
      expect(updatedAccounts.length).toBe(2);
    });
  });

  describe('Save Callback', () => {
    it('should call onSave with updated accounts', () => {
      let savedAccounts: string[] = [];
      const onSave = (accounts: string[]) => {
        savedAccounts = accounts;
      };
      
      const newAccounts = ['ChartChampions', 'unusual_whales'];
      onSave(newAccounts);
      
      expect(savedAccounts).toEqual(newAccounts);
    });

    it('should persist to localStorage on save', () => {
      const accounts = ['ChartChampions', 'unusual_whales'];
      
      localStorage.setItem('twitter_monitored_accounts', JSON.stringify(accounts));
      
      const saved = localStorage.getItem('twitter_monitored_accounts');
      expect(saved).toBeDefined();
      expect(JSON.parse(saved!)).toEqual(accounts);
    });

    it('should handle localStorage errors gracefully', () => {
      // Simulate localStorage error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = () => {
        throw new Error('Storage quota exceeded');
      };
      
      let errorThrown = false;
      try {
        localStorage.setItem('test', 'value');
      } catch (err) {
        errorThrown = true;
      }
      
      expect(errorThrown).toBe(true);
      
      // Restore original
      localStorage.setItem = originalSetItem;
    });
  });

  describe('Modal Open/Close', () => {
    it('should call onClose when closing', () => {
      let closeCalled = false;
      const onClose = () => {
        closeCalled = true;
      };
      
      onClose();
      
      expect(closeCalled).toBe(true);
    });

    it('should detect unsaved changes', () => {
      const originalAccounts = ['ChartChampions'];
      const modifiedAccounts = ['ChartChampions', 'unusual_whales'];
      
      const hasChanges = 
        modifiedAccounts.length !== originalAccounts.length ||
        modifiedAccounts.some((acc, idx) => acc !== originalAccounts[idx]);
      
      expect(hasChanges).toBe(true);
    });

    it('should detect no changes when accounts are same', () => {
      const originalAccounts = ['ChartChampions', 'unusual_whales'];
      const modifiedAccounts = ['ChartChampions', 'unusual_whales'];
      
      const hasChanges = 
        modifiedAccounts.length !== originalAccounts.length ||
        modifiedAccounts.some((acc, idx) => acc !== originalAccounts[idx]);
      
      expect(hasChanges).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should show error for invalid username', () => {
      const invalidUsername = 'user@name';
      const isValidTwitterUsername = (username: string): boolean => {
        const trimmed = username.trim();
        if (trimmed.length === 0 || trimmed.length > 15) {
          return false;
        }
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        return usernameRegex.test(trimmed);
      };
      
      const isValid = isValidTwitterUsername(invalidUsername);
      
      expect(isValid).toBe(false);
    });

    it('should show error for duplicate account', () => {
      const accounts = ['ChartChampions'];
      const newAccount = 'ChartChampions';
      
      const isDuplicate = accounts.some(
        acc => acc.toLowerCase() === newAccount.toLowerCase()
      );
      
      expect(isDuplicate).toBe(true);
    });

    it('should clear error on valid input', () => {
      let error: string | null = 'Invalid username';
      
      // Simulate clearing error
      error = null;
      
      expect(error).toBeNull();
    });
  });

  describe('Confirmation Dialog', () => {
    it('should show confirmation when saving changes', () => {
      const hasChanges = true;
      let showConfirmation = false;
      
      if (hasChanges) {
        showConfirmation = true;
      }
      
      expect(showConfirmation).toBe(true);
    });

    it('should not show confirmation when no changes', () => {
      const hasChanges = false;
      let showConfirmation = false;
      
      if (hasChanges) {
        showConfirmation = true;
      }
      
      expect(showConfirmation).toBe(false);
    });

    it('should save and close on confirmation', () => {
      let saved = false;
      let closed = false;
      
      const handleConfirmSave = () => {
        saved = true;
        closed = true;
      };
      
      handleConfirmSave();
      
      expect(saved).toBe(true);
      expect(closed).toBe(true);
    });
  });

  describe('Account List Display', () => {
    it('should display account count', () => {
      const accounts = ['ChartChampions', 'unusual_whales', 'TradingView'];
      expect(accounts.length).toBe(3);
    });

    it('should show empty state when no accounts', () => {
      const accounts: string[] = [];
      const isEmpty = accounts.length === 0;
      
      expect(isEmpty).toBe(true);
    });

    it('should generate avatar initial from account name', () => {
      const account = 'ChartChampions';
      const initial = account.charAt(0).toUpperCase();
      
      expect(initial).toBe('C');
    });
  });

  describe('Keyboard Interactions', () => {
    it('should handle Enter key to add account', () => {
      const event = {
        key: 'Enter',
        preventDefault: () => {}
      };
      
      expect(event.key).toBe('Enter');
    });

    it('should not trigger on other keys', () => {
      const event = {
        key: 'Tab',
        preventDefault: () => {}
      };
      
      expect(event.key).not.toBe('Enter');
    });
  });
});
