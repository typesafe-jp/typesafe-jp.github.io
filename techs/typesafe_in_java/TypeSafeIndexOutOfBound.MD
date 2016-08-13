# バグの潜在：配列へアクセス、不必要な自由

> この記事を読む前には、
>
> 1) 前文（[バグの潜在：if...else...の危険性](?typesafe_in_java/TypeSafeIfElse)） を事前に習得することがお勧めです。
>
> 2) この記事は、JAVA言語を前提で説明していくため、JAVA5以上の知識が望まれています。
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

`list.get(0)`のように、Listや配列がindexよりアクセス可能によって、
実行時有名な`IndexOutOfBoundsException`が発生する危険性あります。

[TypeSafeの観点](?WhyTypeSafe)より、下記の原則あります：

> エラー（バグ）は、`実行`段階で発生するより、できるだけ`実行前`（例え、コンパイル）の段階で検知する

その理由は：

`実行`段階で発生するエラーは、
データ状態による、発生する場合と発生しない場合もあります。

データによって実行ルートが違いため、再現性がなくなり、
バグ調査が難しくなります。

さらに、発生する場合が特定できず（テスト漏れなど理由で）、
そのまま商用リリースしたシステムに対するのは「時限爆弾」です。

> 他の問題は：
>
> 前の記事[バグの潜在：if...else...の危険性](?typesafe_in_java/TypeSafeIfElse)]
> で説明しますので、本文割愛します。


## TypeSafe解決案

TypeSafeよりの解決案は：

1. indexより要素アクセスより、できるだけ`意味あるメソッド`よりアクセス
2. indexより要素へアクセス徹底禁止

上記の２ポイントを例で説明します：

### 例１ 　indexより要素アクセスより、できるだけ`意味あるメソッド`よりアクセス

前文（[TypeSafe@企業・中大規模プロジェクト](?typesafe_in_java_enterprise/TypeSafeCollection)）
より、NotEmpytListを必ず要素が持つListの表現としています。

NotEmpytList（１件以上）の場合、一番目と最後の要素が必ず存在するので、
その特徴を利用で、ソースコードをfirst(), last()で一番目と最後の要素をはっきり表現できます：

```java
void doFoo(MayEmptyList<Integer> mayEmpty) {

    mayEmpty.ifPresent(
        (NotEmpytList　notEmpty) -> {
            // 問題解決： Listが空ではないので、first()/last()は必ず存在！
            int firstNum = notEmpty.first();

            doBar(firstNum);
        },
        () -> {
            throw new RuntimeException("Never");
        }
    }
}
```

### 例2　　indexより要素へアクセス徹底禁止

Java5から型の安全性(`TypeSafe`)の`for-each`の導入で、
index経由せずListにアクセスできる大きな進化でした：

```java
        for (String str : stringList) {
            // iterable_element
        }
```

但し、indexの情報が必要な場合、危険な「index経由アクセス」の書き方に戻さないといけない問題あります。

```java
        for (int i = 0; i < array.length; i++) {
             doSomething(i, array[i]);
        }
```

[Java8のLambda](http://www.oracle.com/technetwork/jp/articles/java/architect-lambdas-part1-2080972-ja.html)
はJavaを関数向けプログラミングに大きな進化です。Lambdaより上記の問題簡単に解決できます。

例：

```java
void doFoo(MayEmptyList<Integer> mayEmpty) {

    mayEmpty.forEach( // forEachはMayEmptyListサポートしているlambda式
        (element, index) -> {

            // 問題解決： elementとindexがセットでくるので、安心利用可能です
            doSomething(index, element);
        }
    }
}
```

## 結論

上記のように、Listや配列へのアクセス不必要なアクセス自由を徹底的に取り除き、
その自由の危険さを吸収する部品(例、forEach、first、last)の提供で、
よりもっと安全なソフトウェアを作られます。

---

## TypeSafe FAQ

- Java8のlambda詳しくない、部品の作り方分からない
- 「for文好き」の世界観では、どういうふうにプロジェクト全体に適用できるか
- どうしてもindexよりアクセスしたい場合どうすべきか
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
