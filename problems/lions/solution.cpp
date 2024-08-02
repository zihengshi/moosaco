#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

int n, k, res;
string s;
vector<int> l[25];
bool visited[50000000];

void dfs(int words, int letters, int num_words) { // words and letters are bitmasks
    if (visited[words]) return;
    if (num_words > n) return;

    visited[words] = 1;

    for (int i = 0; i < n; i++) {
        if (words & (1 << i)) continue; // it contains this word, so skip

        int new_letters = letters;
        for (int letter : l[i]) new_letters |= (1 << letter);
        if (__builtin_popcount(new_letters) > k) continue;

        dfs(words | (1 << i), new_letters, num_words + 1);
    }

    res = max(res, num_words);
}

int main() {
    cin >> n >> k;
    for (int i = 0; i < n; i++) {
        cin >> s;
        l[i].resize(s.length());
        for (int j = 0; j < s.length(); j++) l[i][j] = s[j] - 'a';
    }
    dfs(0, 0, 0);

    cout << res << endl;
}