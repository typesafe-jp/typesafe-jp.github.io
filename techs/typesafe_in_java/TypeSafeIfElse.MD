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

1. if文・先決条件書き漏れやすい
2. else文・書き漏れやすい

> もう１つの問題は：
> Listがindexよりアクセス可能で、実行時`IndexOutOfBoundsException`が発生する危険があります。
> 次回の記事[配列へアクセス：不必要な自由](?typesafe_in_java/TypeSafeIndexOutOfBound_not_open)
> で説明いたしますので、本文割愛します。


## 問題1：if文・先決条件書き漏れやすい

初耳なら、「if文漏れ？」と意味不明だと思います。

上記の実装例には、

`!list.isEmpty()`を判定してから`list.get(0)`、２ステップで分けられています。

２ステップで**分かれるだからこそ**、
先決条件としての`!list.isEmpty()`を判定せず
`list.get(0)`を呼び出してしまうと、
`IndexOutOfBoundsException`が発生する危険性があるからです。

「そんな簡単なバグはすぐ簡単に見つける」と思っている人が多いかもしれないが、
単純なミス、他チームで既に判定済みなどの誤認識で、
このバグが意外と多いです。

さらに、このバグは、特定な条件だけで発生するRuntimeのエラーとなり、
商用リリースして、なん年間うまく動いたシステムとしても、
急に落ちるケースがおかしくないです。

重要なシステム（特にお金に関わるシステム）には、その危険性を許容できないです。

その危険性を排除する方法は：

- 目視チェックするか（チェック漏れあり）
- ソースチェックツールの導入(FindBugsなど一部パターンのみ対応可能)
- 大量テストで保証する（テスト漏れあり）

いくつありますが、根本的な（シンプル・安い）解決案ではないです。

> ソースチェックツールの関する、[ソースチェックツールの限界、FindBugsのデメリット](?typesafe_in_java/CodeAnalysisTools_not_open)
> へご参照してください。

## 問題2：else文・書き漏れやすい

elseなしのソースコードが良く見られていて、
else省略することが教科書からのもう１つの「常識」かもしれないです。

ただ、他人のソースを読む際に、特に障害調査する際に良くある思考です：
「このif分のelseの場合どうなる？本当に不要か、考え漏れか？」

TypeSafeの観点より、「ソースコードは人間に読ませるために」存在しています、
なので、可読性（readability）を非常に大事にしています。

else省略することで、ソースコードが短く（`簡単`）なりますが、
読み難く（`簡単≠簡潔`）場合があります。

さらにelse考慮漏れの場合、バグと繋ぎます。

**すべての分岐を網羅すべき（else不要としても、必ず「elseは有り得ないパターン」と明記する）という
`強制思考`を実装者に要求するのは、安全なソースコードを書くために、TypeSafeの原則の１つです。**

## 残課題の再思考

前文（[TypeSafe@企業・中大規模プロジェクト](?typesafe_in_java_enterprise/TypeSafeCollection)）
で説明したように、
Listを
空可能の状態`MayEmptyList`と
空不可の状態`NotEmptyList`を分離することで、
Listがもっと安全に使われると説明しました。

但し、前文にMayEmptyListからNotEmptyListに変換するため、通常の書き方だっと、
同じ`if...else...`問題が残ります：

```java
void doFoo(MayEmptyList<Integer> mayEmpty) {

    if (!mayEmpty.isEmpty()) { // Step1:先決条件チェック
        NotEmpytList notEmpty = new NotEmpytList(mayEmpty); // Step2: mayEmptyは空ならException
        // 結論： 2ステップ問題解消できず課題

        int num = notEmpty.first();

        doBar(num);
    }
}
```

## TypeSafe解決案：if...else...をカプセル化

TypeSafeから、上記２つ問題への解決案は：

問題1. if文・先決条件書き漏れやすい

　　　答えは：　「判断、判断した値の利用」の２ステップを１ステップにカプセル化すれば、問題解決できる。

問題2. else文・書き漏れやすい

　　　答えは：　elseを書かないとコンパイル通れないように強制的にすれば、問題解決できる。


### 実装例

[Java8でLambda](http://www.oracle.com/technetwork/jp/articles/java/architect-lambdas-part1-2080972-ja.html)
はJavaを関数向けプログラミングに大きな進化です。Lambdaを利用すれば、簡潔なソースコードで問題を簡単に解決できます。

Lambdaでソースを書き直すと：

```java
void doFoo(MayEmptyList<Integer> mayEmpty) {

    mayEmpty.ifPresent( /* List要素存在する場合 */
        notEmpty -> {   /* 注：NotEmpytList　の型省略してもよい */

            // 問題1解決： ifPresent結果が「true」:空以外の場合、MayEmptyListではなく、空ではないと保証したNotEmpytListが同時に提供されるので、２ステップ問題解消！
            int num = notEmpty.first();

            doBar(num);
        },
        () -> {
            // 問題２解決：二番目引数（else）が必ず求めて、elseの明記が必須となる！
            throw new RuntimeException("Never happen in this case");
        }
    }
}
```

## 結論

上記のように、
「ばらばらだっと危険になる複数ステップ」をカプセル化（例：ifPresent関数）し、
１ステップに纏めて、安全なAPIを提供できる技術より、
よりもっと安全なソフトウェアを作られます。

---

## TypeSafe FAQ

- Java8のlambda詳しくない、部品の作り方分からない
- 「if...else...が当然だろう」の世界観では、どういうふうにプロジェクト全体に適用できるか
- 「if...else...」と類似な危険性のある箇所もっとあるはずが、どうすれば対応すべきか。

いろいろ質問があると思っています。

TypeSafe株式会社は、

- 簡単で貴社の新規・既存のプロジェクトに導入しやすい共通部品
- TypeSafe意識が高い開発者

を提供しています。

もっと詳しい情報について、お気軽く[問い合わせ](inquire.html)お待ちしています。

# 次回へ

次回は、本例のもう１つ問題：
[バグの潜在：配列へアクセス、不必要な自由](?typesafe_in_java/TypeSafeIndexOutOfBound)
を説明させていただきます。
お楽しみください。
