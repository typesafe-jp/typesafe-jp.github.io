# バグの潜在：if...else..の危険性

> この記事を読む前には、
>
> 前文（[TypeSafe@企業・中大規模プロジェクト](?typesafe_in_java_enterprise/TypeSafeCollection)）
> を事前に習得することがお勧めです。
>
> 所要時間：約５分

# 実例で問題説明

よく見られるソースコードです

```java
void doFoo(List<Integer> list) {

    if (!list.isEmpty()) {
        int num = list.get(0); // 1件目を取得するために、empty事前にチェックする必要。

        doBar(num);
    }
}
```


# 問題とは？

２点の潜在問題あります。

## チェックと利用が分離

上記の実装が許せるシステムには、１つ潜在の危険性（バグ）があります：

`!list.isEmpty()`の判定と、`list.get(0)`が２ステップで分けられているので、

`list.isEmpty()`を判定せずに、
`list.get(0)`を呼び出してしまうと、
`IndexOutOfBoundsException`が発生する可能性あります。

簡単なサンプルまだそんなバグは無いと思いますが、
大規模システムには、その危険性を排除する方法は目視チェック以外、ないです。

## 問題2

サンプルソースコードの問題は、List自体は、
配列の要素がindexで自由にアクセスできることで、
実行時`IndexOutOfBoundsException`が発生する可能性あります。

問題２は、[次回の記事](?typesafe_in_java/TypeSafeIndexOutOfBound)で説明いたします。

## TypeSafe解決案　課題

前文（[TypeSafe@企業・中大規模プロジェクト](?typesafe_in_java_enterprise/TypeSafeCollection)）
で説明したように、Listを空可能の状態`MayEmptyList`と空不可の状態`NotEmptyList`を分離で、Listがもっと安全に使われると説明しました。

`list.get(0)`を`NotEmptyList.first()`に書き替えすれば、絶対IndexOutOfBoundsExceptionになら無いよう保証できます。

但し、MayEmptyListからNotEmptyListに変換するため、サンプルの書き方だっと、２ステップが分かれてしまって、結局危険性（バグ）が残ってしまいます。


```java
void doFoo(MayEmptyList<Integer> mayEmpty) {

    if (!mayEmpty.isEmpty()) {
        NotEmpytList notEmpty = convertToNotEmpytList(mayEmpty); // 課題：2ステップ問題解消できず

        int num = notEmpty.first(); // notEmptyは絶対1以上だから、get(0)をfirst()で安全でlistにアクセスできる。

        doBar(num);
    }
}
```

## 課題対応

[Java8でLambda](http://www.oracle.com/technetwork/jp/articles/java/architect-lambdas-part1-2080972-ja.html)の対応は大きな進化です。

TypeSafeからの観点で、`実行時のExceptionをなるべくCompile時点で無くす`の方針がございます。







## TypeSafeデメリット

- Java8のlambda詳しくない、部品の作り方分からない
- 「if...else...が当然だろう」の世界観では、どういうふうにプロジェクト全体に適用できるか
- 危険性のある箇所もっとあるか、どうすれば対応すべきか。

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