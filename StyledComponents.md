### styled-componentsの使い方をパッとわかりやすく、色々なパターンを説明することを目指す記事

![styled-compoents](http://kenjimorita.jp/wp-content/uploads/2018/06/766758FB-FE5E-42D0-A1D3-017EBF60FE51.jpeg)


[Document styled-components](https://www.styled-components.com/)





#### 前提

```js
//importする
import styled from 'styled-components'
```


#### 最小の指定

[styled](https://www.styled-components.com/docs/api#styled)

```js
cosnt Button = styled.button`
  color: red;
`
//render
<Button>ボタン</Button>
```

#### ``は何??

[styled-componentで使われているTaggedTemplateLiterals](https://mxstbr.blog/2016/11/styled-components-magic-explained/)

```styled.button``  ```と```styled.button()```は同じ
違いは引数を渡すと値になるかだけ


```
const logArgs = (...args) => console.log(...args)
```

これはただの引数を渡したら渡された引数を出力する関数。

単純に

```
logArgs('a', 'b');
//-> a b
```

じゃあtagged template literalで呼んでみる。

```
logArgs``
//-> [""]
```

続きWIP



### defaultPropsとして指定する

```js
cosnt Button = styled.button`
  color: red;
  backgroun: ${(theme) => thme.main}
`
Button.defaultProps = {
  theme: {
      main: "#0088ee"
  }
}
```

### 呼び出し時指定する

```js
const Button = styled.button`
  color: ${({theme}) => theme.main};
  border: 2px solid ${({theme})=> theme.main};
`
//render
<Button theme={{main: red}}></Button>

```

### 拡張する

```js
cosnt Button = styled.button`
  color: red;
`
const ButtonExtend = Button.extend`
  border-color: green
`
```

### styleは一緒でタグだけ変えたい

```js
cosnt Button = styled.button`
  color: red;
`
const StyledLink = Button.withComponent('a')

//render
<Button>ボタン</Button>
<StyledLink>リンク</StyledLink>

```

### styleは一緒でタグだけ変えた後拡張したい

[withComponent](https://www.styled-components.com/docs/api#withcomponent)

```js
cosnt Button = styled.button`
  color: red;
`
const StyledLink = Button.withComponent('a')
const StyledLinkEx = StyledLink.extend`
  color: red
`

```

### componentからのpropsをstyledへのpropsに渡せる。連結させる。

[attrs](https://www.styled-components.com/docs/api#attrs)
- 呼び出し時に渡したpropsを元に動的に変更する
- staticなprops記述もできる

```js
const Button = styled.button.attrs({
    type:'password',//staticなprops
    margin: props => props.size || '1em',//sizeとして受け取りmappingしている
    padding: props => props.size || '1em'//sizeとして受け取りmappingしている
    //共通部分はこの下に書く
})`
    font-size: 1em;
    border-radius: 3px;
    margin: ${props => props.margin};//上で定義したmarginを受け取る
    padding: ${props => props.padding};//上で定義したpaddingを受け取る
`

//render
<Button>ボタン</Button>
<Button size="2em">ボタン</Button>

//最終的にViewされるHTML
<button type="password" margin="1em" padding="1em" class="sc-htpNat fTzOaU">ボタン</button>
<button type="password" margin="2em" padding="2em" class="sc-htpNat fTzOaU">ボタン</button>
```


