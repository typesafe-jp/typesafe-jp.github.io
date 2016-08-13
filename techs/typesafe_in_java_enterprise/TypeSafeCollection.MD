# TypeSafe@企業・中大規模プロジェクト

> この記事を読む前には、
>
> 1)　この記事は、[OOP（オブジェクト指向プログラミング）](https://ja.wikipedia.org/wiki/オブジェクト指向プログラミング)概念が理解している読者に向いています。
>
> 2)　この記事は、中大規模のプロジェクトの前提が想定しています。
>
> 3)　この記事は、JAVA言語を前提で説明していくため、JAVA5以上の知識が望まれています。
>
> 所要時間：約１５分

# 最初の質問

[OOP（オブジェクト指向プログラミング）](https://ja.wikipedia.org/wiki/オブジェクト指向プログラミング)教科書から得られた「常識」は常に中大規模プロジェクト開発に向いてありますか？


# 教科書からの例

## 教科書からListで例

よく見られるサンプルソースです：

```java
List<Integer> list = new ArrayList<>();
```

```java
List<Integer> list = new LinkedList<>();
```

List\<Integer\>はinterfaceで、
その具象クラスを変える場合（例：ArrayList⇛LinkedList)、
ほかのソース変更なくても、同じinterfaceで振舞う可能のメリットがあります。

積極interfaceを利用しましょうは教科書が唱えています。


## 中大規模業務システムに向いているのか

TypeSafeは、interfaceのパワーが否定つもりはないです。

ただ、TypeSafeからの観点では、
具象クラスは共通interfaceより詳しい情報が持ってるので、
具象クラスの利用でもっと効果得られる場合もあります。

特に中大規模のプロジェクト開発には、 **詳しい情報持っている具象クラスを積極利用で、
ソースコードが齟齬なし、簡単明瞭で業務を表現できる** 大きなメリットがあります。


# 実例で問題説明

## サンプルアプリケーション

下記のケースを考えましょう。

中大規模のシステムは[MVCのモデル](https://ja.wikipedia.org/wiki/Model_View_Controller)で開発し、
V（画面）、C（制御）、M（データ格納）、三つの開発チームに分けられています。

また、テストチーム含めるなら、４チームです。

４チームで下記のプログラムを分担開発・テストにしましょう：

「画面から入力したパラメータ`1, 3, 3, 2`を
`1, 2, 3`（昇順でソートし、かつ重複取り除いた値だけ）
でファイルに格納する」とてもシンプルな要件です。

各チームは[API](https://ja.wikipedia.org/wiki/アプリケーションプログラミングインタフェース)を定義の上、開発に進む形です。

## V（画面）チーム

V（画面）チームのAPIは、パラメータを受け取り、下記のリストを作って、C（制御）チームを呼出するように：

```java
void doView(Parameter parameters) {
    List<Integer> parameterList = createList(parameters); // 結果：[1, 3, 3, 2]

    doController(parameterList); // 次は、CチームのAPIを呼び出し
}
```

## C（制御）チーム

C（制御）チームのAPIは、パラメータ受け取ったら、ソートと重複値取り除いた結果で、M（データ格納）チームを呼出するように：

```java

void doControll(List<Integer> parameterList) { // 入力：[1, 3, 3, 2]

    List<Integer> sortedList = sort(parameterList); // ソート結果： [1, 2, 3, 3]
    List<Integer> distinctedList = distinct(sortedList); // 重複取り除いた結果： [1, 2, 3]

    doModel(distinctedList); // 次は、MチームのAPIを呼び出し
}
```


## M（データ格納）チーム

M（データ格納）チームのAPIは、もらったデータを格納する、

```java
void doModel(List<Integer> distinctedList) {

    saveToDatabase(distinctedList);
}
```


## 問題とは？

上記の開発流れで、成果物（簡潔な処理フロー、無駄なソースコードなし）として問題はありません。
そして、`List<Integer>`で各チーム間のAPIのパラメータとして渡していて、interface Listの具象（ArrayListかLinkedListか）を意識必要はありません。

但し、最大な問題は 【**上記のソースはチーム向けではなく、少数人数開発向けのアプローチ**】 と考えられています。

中大規模のプロジェクトでは、チーム間のコミュニケーションの効率が下がり、一番大きな問題はチームの実装範囲の特定です。

**問題発生した場合、責任の範囲が不明で、どっちのチームで対応すべきかの責任が不明になります。**

### 潜在問題１ 責務不明

例えば、上記のサンプルにで、「Listが空の場合の制御が漏れてしまう」のバグが発生しました。

他のチームでListの空チェック済みかは完全に信用できないと判断する場合は、
結局各チーム自身のソースコードを守るために、「Defensiveプログラミング」として
各チームも空チェックを行うことになってしまいます。

C（制御）チームのソースはこうなってしまう：

```java

void doControll(List<Integer> parameterList) { // 入力：[1, 3, 3, 2]

    if (!list.isEmpty()) {

        List<Integer> sortedList = sort(parameterList); // ソート結果： [1, 2, 3, 3]
        List<Integer> distinctedList = distinct(sortedList); // 重複取り除いた結果： [1, 2, 3]
    } else {

        showError(); // 本当にelse分岐に入るかが不明
    }
}

```

M（データ格納）チームのソースはこうなってしまう：

```java
void doModel(List<Integer> distinctedList) {

    if (!list.isEmpty()) {
        saveToDatabase(distinctedList);
    } else {
        showError(); // 本当にelse分岐に入るかが不明
    }
}
```

### 潜在問題２ Naming問題

> "There are only two hard problems in Computer Science:
>     cache invalidation and naming things."
>
>   -- Phil Karlton

Namingは難しいです。

各チームのAPIに定義された複数の`List<Integer>`のパラメータ名や変数名を確認したら：

- List\<Integer\> parameterList
- List\<Integer\> sortedList
- List\<Integer\> distinctedList

確かに意味明確なNamingと思います。

但し、TypeSafeからの観点では、Naming（名前）やDocument（コメント含め）で説明された情報だけに頼ると、
下記のリスクがあると考えられます：

- ミス（コピーペイのミス、コミュニケーションのミス等）でNamingが不正になってしまう。
- 最初のNamingが正しかったが、仕様変更が経て、Namingの意味変わってしまう。
- Namingの表現力が足りず、正しく利用になれないことになってしまう。



よって、「 **名前やコメントだけでは、嘘つきになる可能性ある** 」と考えられています。

中大規模開発には、各チームを自己のソースがバグならないように（責任を守るのために）、
多重実装になってしまう可能性高いです。

例えば、
M（データ格納）チームを「念のために」もう一度昇順でソートと、重複取り除く実装をやってしまう可能性があります：

```java
void doModel(List<Integer> distinctedList) {

    if (!list.isEmpty()) {              // 念のためもう一度Emptyチェック
        saveToDatabase(
            distinct(                   // 念のためもう一度値を重複取り除く
               sort(distinctedList)));  // 念のためもう一度ソート
    } else {
        showError(); // 本当にelse分岐に入るかが不明
    }
}
```

# 問題の影響

## 影響１　性能

無駄な操作（Listに多重ソートなど）が増えてしまうと、
性能問題になりやすいです。

小さいなデータ量ならまだ良いですが、
企業向けのデータが多いので、全体の性能に大きく影響してしまう可能性あります。


## 影響２　品質

### テストチーム

テストチーム忘れないでください、無駄な実装が増えて、テストの仕事も増えてしまいます。

テストには、[ソースのカバレッジ](https://ja.wikipedia.org/wiki/コード網羅率)が１つの重要な指標となります。

例えば、
空チェック不要で良かったが、念のためにチェックしてしまったら、
[dead code](https://ja.wikipedia.org/wiki/到達不能コード)が発生します。

そのdead codeの発生で、テスト結果のカバレッジ率も下がり、
そのカバレッジをカバ通れるために、

- テストチームが無駄な単体テストケース作ってしまうか、
- 開発者に再調査依頼するか、

無駄な仕事が増えてしまいます。

### バグ調査

バグ発生したら、ソースを読むことが必要になるとき、
空チェック不要で良かったが、念のためにチェックしてしまったら、無駄な`if...else...`分岐が増えて、
その`else`は本当に不要か、バグの原因でしょうか、調査分析を行い、大量時間かかってしまいます。

さらに、プロジェクトリリース後、保守の段階に入っても、開発者の交替で、
同じこと（無駄なソースへの分析）を何度も繰り返しることは、たくさんの開発現場の事実てす。

## 影響３　プロジェクト管理面

**高い給料のエンジニアの時間を無駄な作業をさせたくない！**

いくら管理面が優秀としても、実装面が充分な意識がなかったら、結局無駄な作業どんどん増えてしまって、
プロジェクトの赤字や破綻と繋がります。

# TypeSafeのソリューション

さあ、何か簡単な解決案はあるのでしょうか。

答えは`TypeSafe`のソリューションです。

**TypeSafeで詳しい情報持っている具象クラスを積極利用で、
ソースコードで齟齬なし、簡単明瞭で業務ロジックを表現できる** 素晴らしい解決案です。


# 実例でTypeSafeの解決案

TypeSafeの観点では、解決すべき問題点は下記の`嘘つき`可能性あるのパラメータや変数名です：

- List\<Integer\> parameterList
- List\<Integer\> sortedList
- List\<Integer\> distinctedList

`嘘つき`可能性ある名前を解決するために、
`嘘つかない`Listの具象クラス（Type）を作るによって、
各チームの責務がどこまで明確になれるのでしょうか。

実例のソースをTypeSafeで再実装してみます：


## V（画面）チーム

V（画面）チームからパラメータを受け取り、下記のリストを作って、C（制御）チームへ渡す：

```java
void doView(Parameter parameters) {

    // APIパラメータ受け取る時点には、０件可能性あるので、MayEmptyList<Integer> で表現すべき
    MayEmptyList<Integer> parameterList = createList(parameters); // 結果：[1, 3, 3, 2]

    // 空チェック後、必ず１件以上なので、NonEmptyList<Integer> で表現すべき
    NotEmptyList<Integer> parameterNotEmpty = convertToNonEmpty(parameterList);// convertToNonEmptyは、次回の"バグの潜在：if...else..の危険性"で説明

    doController(parameterNotEmpty); // 次CチームのAPI（NotEmptyListで制限済み）を呼び出し
}
```

注意、CチームのAPIを呼出するために、Cチームが求められるType、`NotEmptyList`に変換する必要です。
そうしないと、コンパイルエラーが通れなくて、CチームのAPIを呼び出しはできないからです。

*　Note： convertToNonEmptyメソッドに、 `MayEmptyList`から`NotEmptyList`へ変換のため、通常`if...else`の判断が必要、
それも１つのTypeSafeの非推薦ポイントとなり、次回の[バグの潜在：if...else..の危険性](?typesafe_in_java/TypeSafeIfElse)で説明させていただきます。　*

## C（制御）チーム

C（制御）チームのAPIはNotEmptyListで制限し、Emptyチェック不要なことがわかり、
迷わず次の操作安心で進んでも良いです。

```java

void doControll(NotEmptyList<Integer> parameterList) { // 入力：[1, 3, 3, 2]

    SortedList<Integer> sortedList = list.sort(); // 昇順でソート結果： [1, 2, 3, 3]
    DistinctedList<Integer> distinctedList = sortedList.distinct(); // 重複取り除く結果： [1, 2, 3]

    doModel(distinctedList);
}
```

## M（データ格納）チーム

M（データ格納）チームのAPIはDistinctedListで制限し、すでにソート済みかつ重複値が取り除いたListを求めて、
再チェックが不要なことが分かり、迷わず次の操作安心で進んでも良いです。

```java
void doModel(DistinctedList<Integer> distinctedList) {

    saveToDatabase(distinctedList);
}
```

## 変更点まとめ


下記のように、TypeSafeの観点で、
`同じ型違う変数名`
を
`同じ変数名でも違う型`
で表現するように変更しました。

- Vチーム

  -　APIパラメータ受け取る時点には、０件可能性あるので、
     `MayEmptyList` parameterList　で表現すべき

  -　空チェック後、必ず１件以上なので：
     `NonEmptyList` parameterList　で表現すべき


- Cチーム

  -　APIの入り口時点には、空チェック済みなので、
     `NonEmptyList` parameterList　で表現すべき

  -　昇順でソート後(Sortは **NonEmpty** のは前提)：
     `SortedList` parameterList　で表現すべき

  -　重複取り除いた後(Distinctは **Sortされる** のは前提)：
     `DistinctedList` parameterList　で表現すべき


- Mチーム

  -　APIの入り口時点には、ソート済み、かつ重複取り除いた済みの前提なので、APIのパラメータは　
     `DistinctedList` parameterList　で表現すべき


今度の例に登場したTypeは：

| パターン | Type     |
| --------|---------|
| 0件可能性ある  | MayEmptyList|
| 1件以上       | NotEmptyList|
| ソート済み(かならずNotEmpty)     | SortedList|
|  重複取り除く済み(かならずSorted) | DistinctedList|

# まとめ

## TypeSafeとは

TypeSafeとは、
`同じ型違う変数名`
より、
`同じ変数名でも違う型`
で表現するように変更すべきと主張しています。

各値の状態表現できる明示的な型を作って、
より安全な型（`TypeSafe`）で業務ロジックを表現できるようになります。

## TypeSafeメリット

大きなメリットは、
中大規模のプロジェクト開発には、チーム間のAPIは迷わなく定義できます。

JAVA、C#のような静的な言語のCompilerの制限を最大化し、
「嘘つかない」ソースになります。

ソースコードだけプログラムの意図をはっきり説明し、
余計な実装を防ぐ可能になります。

開発現場への効果は、

- ソースコードだけでチーム間コミュニケーションできる：打合せの会議不要！
- 無駄な作業（多重実装、無駄テストなど）削減：納期守られる
- ソフトウェア品質上がる：開発から保守まで安心


## TypeSafe FAQ

型で状態表現してしまうと、型の数がどんどん増えてしまって、

- どこまで型作ればよいか、
- 型を作る際に注意点は何でしょうか、
- 型どんどん増えても、簡潔、自然でプログラミングできる方法はないでしょうか、
- プロジェクトにどう導入すればよいのか。

いろいろ質問があると思っています。

TypeSafe株式会社は、

- 簡単で貴社の新規・既存のプロジェクトに導入しやすい共通部品
- TypeSafe意識が高い開発者

を提供しています。

もっと詳しい情報について、お気軽く[問い合わせ](inquire.html)お待ちしています。

# 次回へ

今まで説明したTypeSafeの思想が良かったですが、
幾つか重要なポイント説明していないです。
このポイントがないと、TypeSafeは成り立てません。

次回は、[TypeSafe成り立てる重要なポイント](?typesafe_in_java_enterprise/TypeSafeKeyPoint_not_open)を説明させていただきます。
お楽しみください。

