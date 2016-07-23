# バグの潜在：nullの危険性

> この記事を読む前には、
>
> 1) 前文（[バグの潜在：if...else...の危険性](?typesafe_in_java/TypeSafeIfElse)）
> を事前に習得することがお勧めです。
>
> 所要時間：約５分

# 実例で問題説明

よく見られるソースコードです

```java
void doFoo(String param) {

    if (param != null) {
        String lower = param.toLowerCase();

        doBar(lower);
    }
}
```


# 問題とは？

２点の潜在問題あります。

前文（[バグの潜在：if...else...の危険性](?typesafe_in_java/TypeSafeIfElse)）
と同じ、
`if...else...`文を利用しているので、２点の潜在問題あります。

1. if文・先決条件書き漏れやすい
2. else文・書き漏れやすい


## 問題1: if文・先決条件書き漏れやすい

上記の実装が許せるシステムには、１つ潜在の危険性（バグ）があります：

`param != null`の判定と、`param.toLowerCase()`が２ステップで分けられているので、

`param != null`を判定せずに、
`param.toLowerCase()`を呼び出してしまうと、
実行時有名な`NullPointException`が発生する可能性あります。

簡単なサンプルなら、そんなバグはすぐ簡単に分かりますが、
重要なシステム（特にお金に関わるシステム）には、その危険性を許容できないです。

- 目視チェックするか（チェック漏れあり）
- ソースチェックツールの導入(FindBugsなど一部パターンのみ対応可能)
- 大量テストで保証する（テスト漏れあり）

いくつありますが、根本的な解決案ではないです。

## 問題2：else文・書き漏れやすい

else文書かないデメリットは
前文（[バグの潜在：if...else...の危険性](?typesafe_in_java/TypeSafeIfElse)）
へご参照ください。

# Java8の解決案

Java8はnull危険の意識で`java.util.Optional<T>`を導入しました。

```java
void doFoo(Optional<String> param) {

    param.ifPresent(
        stringNotNull->
            doBar(stringNotNull));
}
```

但し、 問題1のみ対応可能、問題２は対応していないです。

さらに、残念ですが、Java8のOptional設計は、TypeSafeの大原則：

> エラー（バグ）は、`実行`段階で発生するより、できるだけ`実行前`（例え、コンパイル）の段階で検知する

違反する場合あります：

例えば、
`java.util.Optional.get()`のメソッドで、nullの場合`実行時`にExceptionが発生します。


# TypeSafe解決案

Java8の`java.util.Optional<T>`は巣晴らしい解決案です。
Optionalを利用で、システム全体に、すべての`null`キーワードを解消できて、型安全に大きいな改善です。

TypeSafeからの観点で、Optionalの良いポイントを利用し、
よくないポイント(例、`java.util.Optional.get()`メソッド)を禁止すれば、より安全なJavaプログラミングになります。

```java
void doFoo(Optional<String> param) {

    param.ifPresent(
        stringNotNull->
            doBar(stringNotNull),
        ()->
            doBarWhileNull()); // 問題２解決：else明記が必須！
}
```

# TypeSafe FAQ

- Java8のlambda詳しくない、部品の作り方分からない
- 「nullが当然だろう」の世界観では、どういうふうにプロジェクト全体に適用できるか
- 危険性のある箇所もっとあるではないか、どうすれば対応すべきか。

いろいろ質問があると思っています。

TypeSafe株式会社は、

- 簡単で貴社の新規・既存のプロジェクトに導入しやすい共通部品
- TypeSafe意識が高い開発者

を提供しています。

もっと詳しい情報について、お気軽く[問い合わせ](inquire.html)お待ちしています。

# 次回へ

次回は、より面白い：[Java世界で危険な常識](?typesafe_in_java/TypeSafeJavaLang_not_open)
を説明させていただきます。
お楽しみください。