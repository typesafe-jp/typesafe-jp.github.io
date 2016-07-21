# バグの潜在：if...else...の危険性

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

TypeSafeの観点より、`if...else...`文には、２点の潜在問題あります。

1. if文・書き漏れやすい
2. else文・書き漏れやすい

> もう１つの問題は：
> Listがindexよりアクセス可能で、実行時`IndexOutOfBoundsException`が発生する危険があります。
> 次回の記事[配列へアクセス：不必要な自由](?typesafe_in_java/TypeSafeIndexOutOfBound_not_open)
> で説明いたしますので、本文割愛します。


## 問題1：if文・書き漏れやすい

タイトルだけでありえないと思う人がいますが、
上記の実装例には、

`!list.isEmpty()`を判定してから`list.get(0)`、２ステップで分けられています。

`list.isEmpty()`を判定せず、
`list.get(0)`を呼び出してしまうと、
`IndexOutOfBoundsException`が発生する危険性があるからです。

簡単なサンプルなら、そんなバグはすぐ簡単に分かりますが、
重要なシステム（特にお金に関わるシステム）には、その危険性を許容できないです。

その危険性を排除する方法は：

- 目視チェックするか（チェック漏れあり）
- ソースチェックツールの導入(FindBugsなど一部パターン対応可能)
- 大量テストで保証する（テスト漏れあり）

いくつありますが、根本的な解決案ではないです。

> ソースチェックツールの関する、[ソースチェックツールの限界、FindBugsのデメリット](?typesafe_in_java/CodeAnalysisTools_not_open)
> へご参照してください。

## 問題2：else文・書き漏れやすい

elseなしのソースコードが良く見られていますが、

ソースを見る、特に障害調査する際に良くある思考です：
「elseの場合どうする？本当に不要か、考え漏れか」

TypeSafeの観点より、「ソースコードは人間を読むために」存在なので、
可読性（readability）を大事にしています。

else省略することでソースコードが短く（簡単）なりますが、
読み難く（≠簡潔）場合があります。
考慮漏れの場合、さらにバグと繋ぎます。

すべての分岐を網羅すべき（else不要としても、必ず明記する）という
`強制思考`を実装者に要求するのは、TypeSafeのルールの１つです。

## 残課題

前文（[TypeSafe@企業・中大規模プロジェクト](?typesafe_in_java_enterprise/TypeSafeCollection)）
で説明したように、Listを空可能の状態`MayEmptyList`と空不可の状態`NotEmptyList`を分離で、Listがもっと安全に使われると説明しました。

但し、MayEmptyListからNotEmptyListに変換するため、通常の書き方だっと、
同じ`if...else...`問題があります：

```java
void doFoo(MayEmptyList<Integer> mayEmpty) {

    if (!mayEmpty.isEmpty()) { // Step1:
        NotEmpytList notEmpty = new NotEmpytList(mayEmpty); // Step2: 2ステップ問題解消できず課題

        int num = notEmpty.first();

        doBar(num);
    }
}
```

## TypeSafe解決案

TypeSafeの具体的な解決案は

1. if文・書き漏れやすい　　
　　　答え：　２ステップを１ステップにすれば、問題解決できる。
2. else文・書き漏れやすい
　　　答え：　elseを書かないとコンパイル通れないなら、問題解決できる。


[Java8でLambda](http://www.oracle.com/technetwork/jp/articles/java/architect-lambdas-part1-2080972-ja.html)
は大きな進化です。Lambdaを利用すれば、簡単に解決できます。

Lambdaでソースを書き直すと：

```java
void doFoo(MayEmptyList<Integer> mayEmpty) {

    mayEmpty
    .ifPresent( /* List要素存在する場合 */
        notEmpty -> {   /* 注：notEmpty は　NotEmpytList　notEmptyの型省略したものです */
            // 問題1解決： Listが空ではない時点、すでにNotEmpytList向けプログラミングので、チェック忘れはありません
            int num = notEmpty.first();

            doBar(num);
        },
        () -> {
            throw new RuntimeException("Never"); // 問題２解決：else明記が必須！
        }
    }
}
```

## 結論

上記のように、ばらばらだっと危険性がある複数ステップをライブラリー（例：ifPresent）に隠蔽し、
１ステップとしてAPIを提供する技術はもっと安全なソフトウェアの基盤になります。

---

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

次回は、本例のもう１つ問題：
[配列へアクセス：不必要な自由](?typesafe_in_java/TypeSafeIndexOutOfBound_not_open)
を説明させていただきます。
お楽しみください。
