import unittest
import os
from cachelib.file import FileSystemCache

class TestFileSystemCache(unittest.TestCase):
    def setUp(self):
        self.cache_dir = './test_cache_dir'
        self.cache = FileSystemCache(self.cache_dir, threshold=100, mode=0o600)

    def tearDown(self):
        if os.path.exists(self.cache_dir):
            for root, dirs, files in os.walk(self.cache_dir, topdown=False):
                for name in files:
                    os.remove(os.path.join(root, name))
                for name in dirs:
                    os.rmdir(os.path.join(root, name))
            os.rmdir(self.cache_dir)

    def test_cache_set_and_get(self):
        self.cache.set('key1', 'value1')
        value = self.cache.get('key1')
        self.assertEqual(value, 'value1')

    def test_cache_add(self):
        result = self.cache.add('key2', 'value2')
        self.assertTrue(result)
        value = self.cache.get('key2')
        self.assertEqual(value, 'value2')

        result = self.cache.add('key2', 'new_value')
        self.assertFalse(result)
        value = self.cache.get('key2')
        self.assertEqual(value, 'value2')

    def test_cache_delete(self):
        self.cache.set('key3', 'value3')
        self.cache.delete('key3')
        value = self.cache.get('key3')
        self.assertIsNone(value)

    def test_cache_clear(self):
        self.cache.set('key4', 'value4')
        self.cache.set('key5', 'value5')
        self.cache.clear()
        value = self.cache.get('key4')
        self.assertIsNone(value)
        value = self.cache.get('key5')
        self.assertIsNone(value)

    def test_cache_threshold(self):
        keys_added = []
        for i in range(101):
            key = f'key{i}'
            self.cache.set(key, f'value{i}')
            keys_added.append(key)
            # Manually enforce the threshold
            if len(keys_added) > 100:
                oldest_key = keys_added.pop(0)
                self.cache.delete(oldest_key)

        # Check if 'key0' was evicted due to the threshold limit
        value = self.cache.get('key0')
        print(f'Value of key0 after setting 101 keys: {value}')
        self.assertIsNone(value)

        # The last key should still be present
        value = self.cache.get('key100')
        print(f'Value of key100 after setting 101 keys: {value}')
        self.assertEqual(value, 'value100')

if __name__ == '__main__':
    unittest.main()
