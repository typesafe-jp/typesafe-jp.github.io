# TypeSafe@企業・中大規模プロジェクト

OOP教科書から得られた経験は中大希望プロジェクト開発に向いてありますか？

```
この文章を読む前には、

① OOP（オブジェクト指向プログラミング）概念が理解している読者に向いています。
② この文章は、中大規模のプロジェクトの前提が想定しております。
③ JAVA言語を前提で説明していくため、JAVA5以上の知識が望まれています。
```

# 教科書の例

## 教科書からListで例

よく見られるソース例です：

```java
List<Integer> list = new ArrayList<>();
```

```java
List<Integer> list = new LinkedList<>();
```

List<Integer>はinterfaceで、
その具象クラスを変えても（ArrayList->LinkedList)、
ほかのソース変えなくても、同じinterfaceで振舞う可能のメリットがあります。
積極interfaceを利用しましょうは教科書が唱えています。


## 中大規模業務システムに向いているのか

TypeSafeは、interfaceのパワーが否定つもりははないです。

ただ、TypeSafeの観点では、
具象クラスはinterfaceより詳しい情報が持ってるので、
常にinterfaceで具象クラスを隠すのは良くない場合があります。

特に中大規模のプロジェクト開発には、 **TypeSafeで詳しい情報持っている具象クラスを積極利用で、
ソースだけで齟齬なし、簡単明瞭で**業務を表現できるメリットが大きいです。


# 実例で問題説明

## サンプル説明

下記のケースを考えましょう。

中大規模のシステムは[MVCのモデル](https://ja.wikipedia.org/wiki/Model_View_Controller)で開発し、
V（画面）、C（制御）、M（データ格納）、三つの開発チームに分けられています。また、テストチーム含めるなら、４チームです。

４チームで下記のプログラムを分担開発にしましょう：

「画面から入力したパラメータ`1, 3, 3, 2`を最終的に
`1, 2, 3`（昇順でソートし、かつ重複取り除いた値だけ）
をファイルに格納する」

シンプルな機能を開発しようとしています。

各チームは[API](https://ja.wikipedia.org/wiki/アプリケーションプログラミングインタフェース)を定義の上、開発に進む形です。

## V（画面）チーム

V（画面）チームからパラメータを受け取り、下記のリストを作って、C（制御）チーム提供しており：

```java
void doView(Parameter parameters) {
    List<Integer> parameterList = createList(parameters); // 結果：[1, 3, 3, 2]

    doController(parameterList); // 次CチームのAPIを呼び出し
}
```

## C（制御）チーム

C（制御）チームはパラメータ受け取ったら

```java

void doControll(List<Integer> parameterList) { // 入力：[1, 3, 3, 2]

    List<Integer> sortedList = sort(parameterList); // ソート結果： [1, 2, 3, 3]
    List<Integer> distinctedList = distinct(sortedList); // 重複取り除いた結果： [1, 2, 3]

    doModel(distinctedList);
}
```


## M（データ格納）チーム

M（データ格納）チームは格納する、

```java
void doModel(List<Integer> distinctedList) {

    saveToDatabase(distinctedList);
}
```


## 問題とは？

上記の開発流れで開発と、確かに綺麗なソースができています。
List<Integer>で各チーム間のAPIのパラメータとして渡していて、interface Listの具象（ArrayListかLinkedListか）を意識必要はありません。

但し、最大な問題は **上記のソースはチーム向けではなく、少数人数開発向けのアプローチ**と考えられています。

中大規模のプロジェクトでは、コミュニケーションの効率が下がり、一番大きな問題は責任・実装範囲の特定です。

**問題発生した場合、責任の範囲が不明で、どっちのチームで対応すべきかの責任が不明になります。**

### 潜在問題１

例えば、上記のサンプルにで、「Listが空の場合の制御が漏れてしまう」のバグが発生しました。

常識より、空チェックはV（画面）チームで制御すべき物ですが、C（制御）とM（データ格納）チームがV（画面）のことが完全に信用るか判断できないので、
結局各チーム自身のソースを守るために、「Defensive」的な、各チームも空チェックを行うことになってしまいます。

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

### 潜在問題２

類似で、各チームのAPIの定義がすべて同じ`List<Integer>`パラメータになり：
違うのはパラメータ名や変数名だけです：

- List<Integer> parameterList
- List<Integer> sortedList
- List<Integer> distinctedList


TypeSafeの観点で、Naming（名前）やDocument（コメント含め）で制限されたルールを記載したプログラムは、
下記のリスクがあると考えられます：

- コピーペイのミス、コミュニケーションのミスでNamingが不正になります。
- 最初のNamingが正しかったが、仕様変更が経て、Namingの意味変わってしまう。
- Namingが正しかったが、表現力が足りず、正しく利用になってないことになってします。

よって、 **名前やコメントだけでは、嘘つきになる可能性あります。**と思います。

中大規模開発には、各チームを自己のソースがバグならないように（責任を守るのために）、
多重実装になってしまう可能性高いです。

例えば、
M（データ格納）チームを「念のために」もう一度昇順でソートと、重複取り除を実装してしまう可能性があります：

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

### 潜在問題の影響１　性能

Listに多重ソートなど無駄な操作が増えてしまっても、
プログラムの結果としては、変わらない場合が多いですが、
性能（同じこと何度も繰り返す）には大きく影響されてしまいます。

小さいプラグラムではまだ良いですが、
中大規模プロジェクトになると、全体の性能に大きく影響してしまう可能性あります。

### 潜在問題の影響２　品質

#### テストチーム

テストチーム忘れないでください、無駄な実装が増えて、テストの仕事が増えてしまいます。

テストには、ソースの[カバレッジ](https://ja.wikipedia.org/wiki/コード網羅率)が１つの指標となります。

例えば、
isEmpty()チェック不要で良かったが、念のためにチェックしてしまったら、[dead code](https://ja.wikipedia.org/wiki/到達不能コード)が発生します。
そのdead codeの発生で、テストチームのカバレッジ率下がり、
そのカバレッジをカバ通れるために、
テストチームが無駄な単体テストケース作るか、
開発者に調査依頼するか、
無駄な仕事が増えてしまいます。

#### バグ調査

バグ発生したら、調査が必要になるとき、
isEmpty()チェック不要で良かったが、念のためにしてしまったら、無駄な`if...else...`分岐が増えて、
その`else`は本当に不要か、バグの原因でしょうか、調査に大量時間かかってしまいます。

さらに、プロジェクトリリース後、保守の段階に入っても、開発者の交替で、
同じことを何度も繰り返しるのは開発現場の事実てす。

### 潜在問題の影響３　プロジェクト管理

**高い給料のエンジニアの時間を無駄な作業をさせたくない。**
いくら管理面が優秀としても、実装面がTypeSafe意識がなかったら、無駄な作業どんどん増えてしまって、
プロジェクトの赤字やプロジェクトの倒産と繋がります。

# TypeSafeのソリューション

さあ、何か簡単な解決案はあるのでしょうか。

答えは'TypeSafe'のソリューションです。

**TypeSafeで詳しい情報持っている具象クラスを積極利用で、
ソースだけで齟齬なし、簡単明瞭で** 業務フォローを表現できる素晴らしい解決案です。


# 同じ実例でTypeSafeの解決案

TypeSafeの観点では、問題点は下記の`嘘つき`可能性あるのパラメータや変数名です：

- Vチーム List<Integer> parameterList
- Cチーム List<Integer> sortedList
- Cチーム List<Integer> distinctedList
- Mチーム List<Integer> distinctedList

`嘘つき`可能性ある名前を解決するために、
`嘘つかない`Listの具象クラス（Type）を作って、
各チームの責務がどこまで明確になれますか。

下記のソースで表現してみます：


## V（画面）チーム

V（画面）チームからパラメータを受け取り、下記のリストを作って、C（制御）チーム提供しており：

```java
void doView(Parameter parameters) {

    // APIパラメータ受け取る時点には、０件可能性あるので、MayEmptyList<Integer> で表現すべき
    MayEmptyList<Integer> parameterList = createList(parameters); // 結果：[1, 3, 3, 2]

    // 空チェック後、必ず１件以上なので、NonEmptyList<Integer> で表現すべき
    NotEmptyList<Integer> parameterNotEmpty = convertToNonEmpty(parameterList);// (if...elseの判断は？次回の文章で説明)

    doController(parameterNotEmpty); // 次CチームのAPI（NotEmptyListで制限済み）を呼び出し
}
```

注意、Cチーム明示的に求められるType `NotEmptyList`に変換する必要です。
そうしないと、コンパイルエラーが通れなくて、CチームのAPIを呼び出しできないからです。

_Note： `MayEmptyList`から`NotEmptyList`への変換は、`if...else`の判断が必要、
それもTypeSafe観点にもう１つポイントになり、[次回の文章](?inquire)で説明させていただきます_

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

M（データ格納）チームのAPIはDistinctedListで制限し、すでにソートと重複取り除くチェックが不要なことが分かり、
迷わず次の操作安心で進んでも良いです。

```java
void doModel(DistinctedList<Integer> distinctedList) {

    saveToDatabase(distinctedList);
}
```

## 変更点まとめ


- Vチーム

```
     ⇒　APIパラメータ受け取る時点には、０件可能性あるので、
     MayEmptyList<Integer> parameterList　で表現すべき

　　⇒　空チェック後、必ず１件以上なので：
     NonEmptyList<Integer> parameterList　で表現すべき
```

- Cチーム

```
     ⇒　APIの入り口時点には、空チェック済みなので、
     NonEmptyList<Integer> parameterList　で表現すべき

　　⇒　昇順でソート後(Sortは`NonEmpty`のは前提)：
     SortedList<Integer> parameterList　で表現すべき

     ⇒　重複取り除いた後(Distinctは`Sortされる`のは前提)：
     DistinctedList<Integer> parameterList　で表現すべき
```

- Mチーム

```
     ⇒　APIの入り口時点には、ソート済み、かつ重複取り除いた済みの前提なので、APIのパラメータは　
     DistinctedList<Integer> parameterList　で表現すべき
```

上記のように、TypeSafeの観点で、
`同じ型違う変数名`
より、
`同じ変数名でも違う型`
で表現するように変更しました:

今度の例だっと、
- 0件可能性あるか：　MayEmptyList
- 1件以上: NotEmptyList
- ソート済み(かならずNotEmpty)：　SortedList
- 重複取り除く済み(かならずSorted)：　DistinctList


# まとめ

## TypeSafe有無変化点

TypeSafeの観点で、
`同じ型違う変数名`
より、
`同じ変数名でも違う型`
で表現するように変更するのは、大きな変化です。

型各状態によって、
各状態表現できる型を作って、安全な型（`TypeSafe`）で表現したら、メリットとデメリットを説明いたします。

## TypeSafeメリット

大きなメリットは、
中大規模のプロジェクト開発には、チーム間のAPIは迷わなく定義できて、
ソースだけプログラムの意味がもっと分かりやすくなります。
よって、
ソースだけでチーム間コミュニケーションできる（会議不要！）、
無駄な作業（多重実装、無駄テストなど）削減、
ソフトウェア品質あがると繋がります。

また、
JAVA、C#のような静的な言語のCompilerの制限を最大化し、「嘘つかない」ソースになります。

## TypeSafeデメリット

型で状態表現してしまうと、型の数がどんどん増えてしまって、

- どこまで型作ればよいか、
- 型をどうすればよいでしょうか、
- プロジェクトにどう導入すればよいのか。

いろいろ質問があると思っております。

TypeSafe株式は、簡単で貴社の新規・既存のプロジェクトに導入しやすい共通部品を提供しており、
もっと詳しい情報について、お問い合わせお待ちしております。

# 次回へ

今まで説明したTypeSafeの思想が良いですが、考え漏れたとても幾つか重要なポイントがあります。
このポイントがないと、TypeSafeは成り立てません。

次回は、[TypeSafe成り立てる重要なポイント](?inquire)を説明させていただきます。


