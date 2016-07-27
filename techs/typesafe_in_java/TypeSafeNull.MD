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


# null問題とは？

1. null意味不明
2. `nullチェック忘れ`あります。

> 他の問題は：
>
> 前の記事[バグの潜在：if...else...の危険性](?typesafe_in_java/TypeSafeIfElse)]
> で説明しますので、本文割愛します。


## 問題1: null意味不明

意味不明＝＝曖昧な実装＝＝バグと繋がりです。

例えば、`java.util.Map.get(key)`の結果がnullで返却される場合

1. キーが存在しないか
2. キーが存在しますが、「`データ自体がnull`」か

２つパターンありますので、曖昧な状態になります。

解決案は、明示的に、ある意味のある型（TypeSafe）で「`データ自体がnull`」のことを表現して、
常に 「null＝＝キーが存在しない」 のコーディングルールを作る必要です。

但し、nullが表現できる意味が多いので、
すべての開発者がコーディングルールを守れるかと懸念しています。
例えば、JDKには、nullの動きをはっきりさせるために、
大量なnullに関するコメントを作られています：

- [java.util.Map.get(key)のJavaDoc](http://docs.oracle.com/javase/jp/8/docs/api/java/util/Map.html#get-java.lang.Object-)
- [java.util.Map.put(key, value)のJavaDoc](http://docs.oracle.com/javase/jp/8/docs/api/java/util/Map.html#put-K-V-)


## 問題２：`nullチェック忘れ`あります。

上記の実装の１つ潜在の危険性（バグ）は、
`param != null`の判定と、`param.toLowerCase()`が２ステップで分けられているので、
`param != null`を判定せずに、
`param.toLowerCase()`を呼び出してしまうと、
実行時有名な`NullPointException`が発生する可能性あります。

簡単なサンプルなら、そんなバグはすぐ簡単に分かりますが、
重要なシステム（特にお金に関わるシステム）には、その危険性を許容できないです。

その危険性を排除する方法は：

- 目視チェックするか（チェック漏れあり）
- ソースチェックツールの導入(IDE、FindBugsなど一部パターンのみ対応可能)
- 大量テストで保証する（テスト漏れあり）

いくつありますが、根本的な解決案ではないです。

> ソースチェックツールの関する、[ソースチェックツールの限界、FindBugsのデメリット](?typesafe_in_java/CodeAnalysisTools_not_open)
> へご参照してください。


# Java8のOptional解決案

Java8より、null危険意識し
[`java.util.Optional<T>`](http://docs.oracle.com/javase/8/docs/api/java/util/Optional.html)
が導入されました。
null可能性があるObjectを`Optional<T>`で表現できることです。

`Optional<T>`の導入で何が変わるんでしょうか？例えば、

```java
void doFoo(Optional<String> param) { // null可能性あるよとOptional型で表現

    param.ifPresent(
        stringNotNull-> // nullではない場合、同時に値を提供していて、`nullチェック忘れ`ずに値取得
            doBar(stringNotNull));
}
```

上記の例でif...else..書かなくて良いことで、`nullチェック忘れ`が解消できます。

> 前文（[バグの潜在：if...else...の危険性](?typesafe_in_java/TypeSafeIfElse)）ご参照してください。


# Java8のOptionalの問題

但し、TypeSafeの観点：

> エラー（バグ）は、`実行`段階で発生するより、できるだけ`実行前`（例え、コンパイル）の段階で検知する

より、ルール違反する場合もあります。

Java8のOptionalでは、下記の書き方も許し、
`java.util.Optional.get()`のメソッドで、nullの場合`実行時`にExceptionが発生する：

```java
void doFoo(Optional<String> param) {

    if (param.isPresent)    // 一旦　問題２：`nullチェック忘れ`になり
        doBar(param.get()); // get()メソッドは、`実行時`にExceptionが発生
}
```


# TypeSafe解決案

Java8の`java.util.Optional<T>`は晴らしい解決案です。
Optionalを利用で、システム全体に`null`キーワードを解消できて、型安全に大きいな改善です。

TypeSafeからの観点で、Optionalの良い所（`TypeSafe`）を利用し、
良くない所(`Type UnSafe`な`実行時`にException発生のメソッド)
を利用禁止にすれば、より安全なJavaプログラミングになります。

TypeSafe解決案のlambda実装例：

```java
import ts.immutable.object.Optional;

void doFoo(Optional<String> param) {

    param.ifPresent(
        stringNotNull->  // ifPresent結果が「true」：null以外の場合、値が同時に提供されるので、２ステップ問題解消！
            doBar(stringNotNull),
        ()->
            doBarWhileNull()); // 更に、二番目引数（else）が必ず求めて、elseの明記が必須となる！
}
```

# TypeSafe FAQ

- Java8のlambda詳しくない、部品の作り方分からない
- 「nullチェックが当たり前」の世界観では、どういうふうにプロジェクト全体に適用できるか
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