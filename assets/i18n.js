(() => {
  'use strict';
  const LANGS = ['es','en','fr','pt','zh','ja','ru'];
  const NAMES = {es:'Español',en:'English',fr:'Français',pt:'Português',zh:'中文',ja:'日本語',ru:'Русский'};
  const T = {
    'Inicio':{en:'Home',fr:'Accueil',pt:'Início',zh:'首页',ja:'ホーム',ru:'Главная'},
    'Catálogo':{en:'Catalog',fr:'Catalogue',pt:'Catálogo',zh:'目录',ja:'カタログ',ru:'Каталог'},
    'Descargables':{en:'Downloads',fr:'Téléchargements',pt:'Downloads',zh:'下载',ja:'ダウンロード',ru:'Загрузки'},
    'Skin Studio':{en:'Skin Studio',fr:'Studio Skin',pt:'Estúdio Skin',zh:'皮肤工作室',ja:'スキンスタジオ',ru:'Студия скинов'},
    'Calendar':{en:'Calendar',fr:'Calendrier',pt:'Calendário',zh:'日历',ja:'カレンダー',ru:'Календарь'},
    'GIF Studio':{en:'GIF Studio',fr:'Studio GIF',pt:'Estúdio GIF',zh:'GIF 工作室',ja:'GIFスタジオ',ru:'GIF-студия'},
    'Ajustes':{en:'Settings',fr:'Paramètres',pt:'Configurações',zh:'设置',ja:'設定',ru:'Настройки'},
    'Configuración':{en:'Settings',fr:'Paramètres',pt:'Configurações',zh:'设置',ja:'設定',ru:'Настройки'},
    'Precios':{en:'Pricing',fr:'Tarifs',pt:'Preços',zh:'价格',ja:'料金',ru:'Цены'},
    'Premium':{en:'Premium',fr:'Premium',pt:'Premium',zh:'高级版',ja:'プレミアム',ru:'Премиум'},
    'Salir':{en:'Log out',fr:'Déconnexion',pt:'Sair',zh:'退出登录',ja:'ログアウト',ru:'Выйти'},
    'créditos':{en:'credits',fr:'crédits',pt:'créditos',zh:'积分',ja:'クレジット',ru:'кредитов'},
    'Entrar':{en:'Sign in',fr:'Connexion',pt:'Entrar',zh:'登录',ja:'ログイン',ru:'Войти'},
    'Registro':{en:'Sign up',fr:'Inscription',pt:'Cadastro',zh:'注册',ja:'登録',ru:'Регистрация'},
    'Bienvenido de vuelta':{en:'Welcome back',fr:'Bon retour',pt:'Boas-vindas de volta',zh:'欢迎回来',ja:'おかえりなさい',ru:'С возвращением'},
    'Entrar a tu cuenta':{en:'Sign in to your account',fr:'Connectez-vous à votre compte',pt:'Entre na sua conta',zh:'登录你的帐户',ja:'アカウントにログイン',ru:'Войдите в свой аккаунт'},
    'Correo electrónico':{en:'Email address',fr:'Adresse e-mail',pt:'E-mail',zh:'电子邮箱',ja:'メールアドレス',ru:'Электронная почта'},
    'Contraseña':{en:'Password',fr:'Mot de passe',pt:'Senha',zh:'密码',ja:'パスワード',ru:'Пароль'},
    'Continuar con Google':{en:'Continue with Google',fr:'Continuer avec Google',pt:'Continuar com Google',zh:'使用 Google 继续',ja:'Googleで続行',ru:'Продолжить с Google'},
    'Crear cuenta':{en:'Create account',fr:'Créer un compte',pt:'Criar conta',zh:'创建账户',ja:'アカウントを作成',ru:'Создать аккаунт'},
    'Crear cuenta gratis':{en:'Create a free account',fr:'Créer un compte gratuit',pt:'Criar conta grátis',zh:'创建免费账户',ja:'無料アカウントを作成',ru:'Создать бесплатный аккаунт'},
    'Nombre de usuario':{en:'Username',fr:'Nom d’utilisateur',pt:'Nome de usuário',zh:'用户名',ja:'ユーザー名',ru:'Имя пользователя'},
    'Empieza a crear':{en:'Start creating',fr:'Commencez à créer',pt:'Comece a criar',zh:'开始创作',ja:'制作を始める',ru:'Начните создавать'},
    'Mínimo 10 caracteres':{en:'At least 10 characters',fr:'Au moins 10 caractères',pt:'Mínimo de 10 caracteres',zh:'至少 10 个字符',ja:'10文字以上',ru:'Не менее 10 символов'},
    'Repite la contraseña':{en:'Repeat password',fr:'Répétez le mot de passe',pt:'Repita a senha',zh:'重复输入密码',ja:'パスワードを再入力',ru:'Повторите пароль'},
    '¿Olvidaste tu contraseña?':{en:'Forgot your password?',fr:'Mot de passe oublié ?',pt:'Esqueceu sua senha?',zh:'忘记密码？',ja:'パスワードをお忘れですか？',ru:'Забыли пароль?'},
    'Enviar enlace de recuperación':{en:'Send recovery link',fr:'Envoyer le lien de récupération',pt:'Enviar link de recuperação',zh:'发送重置链接',ja:'再設定リンクを送信',ru:'Отправить ссылку для восстановления'},
    'Diseña, personaliza y exporta.':{en:'Design, customize, and export.',fr:'Concevez, personnalisez et exportez.',pt:'Crie, personalize e exporte.',zh:'设计、自定义并导出。',ja:'デザイン、カスタマイズ、エクスポート。',ru:'Создавайте, настраивайте и экспортируйте.'},
    'Comprar créditos':{en:'Buy credits',fr:'Acheter des crédits',pt:'Comprar créditos',zh:'购买积分',ja:'クレジットを購入',ru:'Купить кредиты'},
    'PayPal o tarjeta':{en:'PayPal or card',fr:'PayPal ou carte',pt:'PayPal ou cartão',zh:'PayPal 或银行卡',ja:'PayPalまたはカード',ru:'PayPal или карта'},
    'Créditos disponibles':{en:'Available credits',fr:'Crédits disponibles',pt:'Créditos disponíveis',zh:'可用积分',ja:'利用可能なクレジット',ru:'Доступные кредиты'},
    'Proyectos guardados':{en:'Saved projects',fr:'Projets enregistrés',pt:'Projetos salvos',zh:'已保存项目',ja:'保存済みプロジェクト',ru:'Сохранённые проекты'},
    'Exportaciones registradas':{en:'Recorded exports',fr:'Exportations enregistrées',pt:'Exportações registradas',zh:'已记录导出',ja:'記録されたエクスポート',ru:'Записанные экспорты'},
    'Costes de exportación':{en:'Export costs',fr:'Coûts d’exportation',pt:'Custos de exportação',zh:'导出费用',ja:'エクスポート料金',ru:'Стоимость экспорта'},
    'Skin Studio: 200 créditos ($2.00 USD)':{en:'Skin Studio: 200 credits ($2.00 USD)',fr:'Skin Studio : 200 crédits (2,00 $ US)',pt:'Skin Studio: 200 créditos (US$ 2,00)',zh:'Skin Studio：200 积分（2.00 美元）',ja:'Skin Studio：200クレジット（2.00米ドル）',ru:'Skin Studio: 200 кредитов (2,00 USD)'},
    'Calendar Studio: 200 créditos ($2.00 USD)':{en:'Calendar Studio: 200 credits ($2.00 USD)',fr:'Calendar Studio : 200 crédits (2,00 $ US)',pt:'Calendar Studio: 200 créditos (US$ 2,00)',zh:'Calendar Studio：200 积分（2.00 美元）',ja:'Calendar Studio：200クレジット（2.00米ドル）',ru:'Calendar Studio: 200 кредитов (2,00 USD)'},
    'GIF Studio: 200 créditos ($2.00 USD)':{en:'GIF Studio: 200 credits ($2.00 USD)',fr:'GIF Studio : 200 crédits (2,00 $ US)',pt:'GIF Studio: 200 créditos (US$ 2,00)',zh:'GIF Studio：200 积分（2.00 美元）',ja:'GIF Studio：200クレジット（2.00米ドル）',ru:'GIF Studio: 200 кредитов (2,00 USD)'},
    'Tus proyectos guardados':{en:'Your saved projects',fr:'Vos projets enregistrés',pt:'Seus projetos salvos',zh:'你保存的项目',ja:'保存したプロジェクト',ru:'Ваши сохранённые проекты'},
    'Ver descargables →':{en:'Browse downloads →',fr:'Voir les téléchargements →',pt:'Ver downloads →',zh:'查看下载 →',ja:'ダウンロードを見る →',ru:'Посмотреть загрузки →'},
    'Diseños listos para usar.':{en:'Ready-to-use designs.',fr:'Des designs prêts à l’emploi.',pt:'Designs prontos para usar.',zh:'即用型设计。',ja:'すぐに使えるデザイン。',ru:'Готовые к использованию дизайны.'},
    'Obtener descarga':{en:'Get download',fr:'Obtenir le téléchargement',pt:'Obter download',zh:'获取下载',ja:'ダウンロードを取得',ru:'Получить загрузку'},
    'Descargar gratis':{en:'Download free',fr:'Télécharger gratuitement',pt:'Baixar grátis',zh:'免费下载',ja:'無料ダウンロード',ru:'Скачать бесплатно'},
    'Publicado':{en:'Published',fr:'Publié',pt:'Publicado',zh:'已发布',ja:'公開済み',ru:'Опубликовано'},
    'Borrador':{en:'Draft',fr:'Brouillon',pt:'Rascunho',zh:'草稿',ja:'下書き',ru:'Черновик'},
    'Guardar proyecto':{en:'Save project',fr:'Enregistrer le projet',pt:'Salvar projeto',zh:'保存项目',ja:'プロジェクトを保存',ru:'Сохранить проект'},
    'Exportar ZIP':{en:'Export ZIP',fr:'Exporter ZIP',pt:'Exportar ZIP',zh:'导出 ZIP',ja:'ZIPをエクスポート',ru:'Экспорт ZIP'},
    'Cargar ZIP':{en:'Load ZIP',fr:'Charger ZIP',pt:'Carregar ZIP',zh:'加载 ZIP',ja:'ZIPを読み込む',ru:'Загрузить ZIP'},
    'Añadir Widget':{en:'Add widget',fr:'Ajouter un widget',pt:'Adicionar widget',zh:'添加小组件',ja:'ウィジェットを追加',ru:'Добавить виджет'},
    'Reloj':{en:'Clock',fr:'Horloge',pt:'Relógio',zh:'时钟',ja:'時計',ru:'Часы'},
    'Fecha':{en:'Date',fr:'Date',pt:'Data',zh:'日期',ja:'日付',ru:'Дата'},
    'Clima Global (Wttr)':{en:'Global weather (Wttr)',fr:'Météo mondiale (Wttr)',pt:'Clima global (Wttr)',zh:'全球天气 (Wttr)',ja:'世界の天気 (Wttr)',ru:'Погода в мире (Wttr)'},
    'Uso de CPU':{en:'CPU usage',fr:'Utilisation du CPU',pt:'Uso de CPU',zh:'CPU 使用率',ja:'CPU使用率',ru:'Загрузка CPU'},
    'Uso de RAM':{en:'RAM usage',fr:'Utilisation de la RAM',pt:'Uso de RAM',zh:'内存使用率',ja:'RAM使用量',ru:'Использование ОЗУ'},
    'Uso de Red':{en:'Network usage',fr:'Utilisation du réseau',pt:'Uso de rede',zh:'网络使用量',ja:'ネットワーク使用量',ru:'Использование сети'},
    'Batería':{en:'Battery',fr:'Batterie',pt:'Bateria',zh:'电池',ja:'バッテリー',ru:'Батарея'},
    'Cargando proyectos…':{en:'Loading projects…',fr:'Chargement des projets…',pt:'Carregando projetos…',zh:'正在加载项目…',ja:'プロジェクトを読み込み中…',ru:'Загрузка проектов…'},
    'Aún no has subido archivos. Usa el formulario para publicar tus ZIP o INI terminados.':{en:'No files uploaded yet. Use the form to publish your finished ZIP or INI files.',fr:'Aucun fichier envoyé. Utilisez le formulaire pour publier vos ZIP ou INI.',pt:'Nenhum arquivo enviado. Use o formulário para publicar seus ZIPs ou INIs.',zh:'尚未上传文件。使用表单发布 ZIP 或 INI。',ja:'まだファイルがありません。フォームからZIPまたはINIを公開してください。',ru:'Файлы ещё не загружены. Используйте форму для публикации ZIP или INI.'},
    'Guardar cambios':{en:'Save changes',fr:'Enregistrer les modifications',pt:'Salvar alterações',zh:'保存更改',ja:'変更を保存',ru:'Сохранить изменения'},
    'Cambiar contraseña':{en:'Change password',fr:'Changer le mot de passe',pt:'Alterar senha',zh:'更改密码',ja:'パスワードを変更',ru:'Изменить пароль'},
    'Contraseña actual':{en:'Current password',fr:'Mot de passe actuel',pt:'Senha atual',zh:'当前密码',ja:'現在のパスワード',ru:'Текущий пароль'},
    'Nueva contraseña':{en:'New password',fr:'Nouveau mot de passe',pt:'Nova senha',zh:'新密码',ja:'新しいパスワード',ru:'Новый пароль'},
    'Repetir nueva contraseña':{en:'Repeat new password',fr:'Répéter le nouveau mot de passe',pt:'Repita a nova senha',zh:'再次输入新密码',ja:'新しいパスワードを再入力',ru:'Повторите новый пароль'},
    'Idioma preferido':{en:'Preferred language',fr:'Langue préférée',pt:'Idioma preferido',zh:'首选语言',ja:'優先言語',ru:'Предпочитаемый язык'},
    'Correo verificado':{en:'Email verified',fr:'E-mail vérifié',pt:'E-mail verificado',zh:'邮箱已验证',ja:'メール認証済み',ru:'Электронная почта подтверждена'},
    'Cuenta Premium':{en:'Premium account',fr:'Compte Premium',pt:'Conta Premium',zh:'高级账户',ja:'プレミアムアカウント',ru:'Премиум-аккаунт'},
    'Gratis':{en:'Free',fr:'Gratuit',pt:'Grátis',zh:'免费',ja:'無料',ru:'Бесплатно'},
    'Estándar':{en:'Standard',fr:'Standard',pt:'Padrão',zh:'标准版',ja:'スタンダード',ru:'Стандарт'},
    'Sin anuncios':{en:'Ad-free',fr:'Sans publicité',pt:'Sem anúncios',zh:'无广告',ja:'広告なし',ru:'Без рекламы'},
    'Suscribirme por $7.00/mes':{en:'Subscribe for $7.00/month',fr:'S’abonner pour 7,00 $/mois',pt:'Assinar por US$ 7,00/mês',zh:'订阅：每月 7.00 美元',ja:'月額7.00米ドルで登録',ru:'Подписка за 7,00 $/мес.'},
    'Cargando entorno…':{en:'Loading workspace…',fr:'Chargement de l’espace…',pt:'Carregando ambiente…',zh:'正在加载工作区…',ja:'ワークスペースを読み込み中…',ru:'Загрузка рабочей области…'},
    'Account suspended':{en:'Account suspended',fr:'Compte suspendu',pt:'Conta suspensa',zh:'账户已暂停',ja:'アカウントが停止されています',ru:'Аккаунт заблокирован'},
    'Completa la verificación CAPTCHA.':{en:'Complete the CAPTCHA verification.',fr:'Terminez la vérification CAPTCHA.',pt:'Conclua a verificação CAPTCHA.',zh:'请完成 CAPTCHA 验证。',ja:'CAPTCHA認証を完了してください。',ru:'Пройдите проверку CAPTCHA.'},
    'Pago completado correctamente.':{en:'Payment completed successfully.',fr:'Paiement effectué avec succès.',pt:'Pagamento concluído com sucesso.',zh:'付款成功。',ja:'支払いが完了しました。',ru:'Платёж успешно завершён.'},
    'Pago cancelado; no se añadieron créditos.':{en:'Payment cancelled; no credits were added.',fr:'Paiement annulé ; aucun crédit ajouté.',pt:'Pagamento cancelado; nenhum crédito foi adicionado.',zh:'付款已取消；未添加积分。',ja:'支払いがキャンセルされ、クレジットは追加されませんでした。',ru:'Платёж отменён; кредиты не начислены.'},
    'No se pudo completar el pago. Intenta de nuevo o revisa la configuración de PayPal.':{en:'Payment failed. Try again or check PayPal configuration.',fr:'Échec du paiement. Réessayez ou vérifiez PayPal.',pt:'Falha no pagamento. Tente novamente ou verifique o PayPal.',zh:'付款失败。请重试或检查 PayPal 配置。',ja:'支払いに失敗しました。再試行するかPayPal設定を確認してください。',ru:'Не удалось выполнить платёж. Повторите попытку или проверьте PayPal.'},
    'No se pudo guardar el nombre de usuario.':{en:'Could not save username.',fr:'Impossible d’enregistrer le nom d’utilisateur.',pt:'Não foi possível salvar o nome de usuário.',zh:'无法保存用户名。',ja:'ユーザー名を保存できませんでした。',ru:'Не удалось сохранить имя пользователя.'},
    'Los cambios se guardaron correctamente.':{en:'Changes saved successfully.',fr:'Modifications enregistrées.',pt:'Alterações salvas com sucesso.',zh:'更改已成功保存。',ja:'変更を保存しました。',ru:'Изменения успешно сохранены.'},
    'Skin Studio: 200 créditos ($2.00 USD de equivalencia) por exportación. Puedes guardar tu proyecto para seguir editándolo luego.':{en:'Skin Studio: 200 credits (USD 2.00 equivalent) per export. You can save your project and keep editing it later.',fr:'Skin Studio : 200 crédits (équivalent à 2,00 USD) par exportation. Vous pouvez enregistrer votre projet et le modifier plus tard.',pt:'Skin Studio: 200 créditos (equivalente a US$ 2,00) por exportação. Você pode salvar seu projeto e continuar editando depois.',zh:'Skin Studio：每次导出 200 积分（相当于 2.00 美元）。你可以保存项目并稍后继续编辑。',ja:'Skin Studio：エクスポート1回につき200クレジット（2.00米ドル相当）。プロジェクトを保存して後で編集を続けられます。',ru:'Skin Studio: 200 кредитов (эквивалент 2,00 USD) за экспорт. Вы можете сохранить проект и продолжить редактирование позже.'},
    'El precio de exportación de Calendar Studio es de 200 créditos ($2.00 USD de equivalencia).':{en:'Calendar Studio exports cost 200 credits (USD 2.00 equivalent).',fr:'Les exportations Calendar Studio coûtent 200 crédits (équivalent à 2,00 USD).',pt:'As exportações do Calendar Studio custam 200 créditos (equivalente a US$ 2,00).',zh:'Calendar Studio 每次导出需要 200 积分（相当于 2.00 美元）。',ja:'Calendar Studioのエクスポートは200クレジット（2.00米ドル相当）です。',ru:'Экспорт Calendar Studio стоит 200 кредитов (эквивалент 2,00 USD).'},
    'Puedes importar un máximo de 4 fuentes por proyecto.':{en:'You can import up to 4 fonts per project.',fr:'Vous pouvez importer jusqu’à 4 polices par projet.',pt:'Você pode importar até 4 fontes por projeto.',zh:'每个项目最多可导入 4 种字体。',ja:'1プロジェクトにつき最大4フォントをインポートできます。',ru:'В один проект можно импортировать не более 4 шрифтов.'},
    'Cada archivo de fuente debe pesar 1 MB o menos.':{en:'Each font file must be 1 MB or smaller.',fr:'Chaque fichier de police doit faire 1 Mo ou moins.',pt:'Cada arquivo de fonte deve ter no máximo 1 MB.',zh:'每个字体文件不得超过 1 MB。',ja:'フォントファイルはそれぞれ1MB以下にしてください。',ru:'Каждый файл шрифта должен быть не больше 1 МБ.'},
    'El GIF original debe pesar 8 MB o menos.':{en:'The original GIF must be 8 MB or smaller.',fr:'Le GIF original doit faire 8 Mo ou moins.',pt:'O GIF original deve ter no máximo 8 MB.',zh:'原始 GIF 不得超过 8 MB。',ja:'元のGIFは8MB以下にしてください。',ru:'Исходный GIF должен быть не больше 8 МБ.'},
    'Tu navegador no soporta el motor nativo ImageDecoder. Por favor usa Google Chrome o Microsoft Edge actualizados.':{en:'Your browser does not support the native ImageDecoder. Please use an up-to-date Google Chrome or Microsoft Edge.',fr:'Votre navigateur ne prend pas en charge ImageDecoder. Utilisez une version récente de Google Chrome ou Microsoft Edge.',pt:'Seu navegador não oferece suporte ao ImageDecoder nativo. Use uma versão atualizada do Google Chrome ou Microsoft Edge.',zh:'你的浏览器不支持原生 ImageDecoder。请使用最新版 Google Chrome 或 Microsoft Edge。',ja:'お使いのブラウザーはネイティブImageDecoderに対応していません。最新のGoogle ChromeまたはMicrosoft Edgeを使用してください。',ru:'Ваш браузер не поддерживает встроенный ImageDecoder. Используйте актуальную версию Google Chrome или Microsoft Edge.'},
    'Los fotogramas PNG superan 8 MB en conjunto. Prueba un GIF más pequeño o con menos fotogramas.':{en:'The PNG frames exceed 8 MB in total. Try a smaller GIF or fewer frames.',fr:'Les images PNG dépassent 8 Mo au total. Essayez un GIF plus petit ou moins d’images.',pt:'Os quadros PNG ultrapassam 8 MB no total. Tente um GIF menor ou com menos quadros.',zh:'PNG 帧总大小超过 8 MB。请尝试更小的 GIF 或减少帧数。',ja:'PNGフレームの合計が8MBを超えています。より小さいGIFかフレーム数の少ないものをお試しください。',ru:'Общий размер PNG-кадров превышает 8 МБ. Попробуйте GIF меньшего размера или с меньшим числом кадров.'},
    'Hubo un error procesando el GIF. Verifica que el archivo no esté corrupto.':{en:'There was an error processing the GIF. Check that the file is not corrupted.',fr:'Une erreur est survenue lors du traitement du GIF. Vérifiez que le fichier n’est pas corrompu.',pt:'Ocorreu um erro ao processar o GIF. Verifique se o arquivo não está corrompido.',zh:'处理 GIF 时出错。请检查文件是否损坏。',ja:'GIFの処理中にエラーが発生しました。ファイルが破損していないか確認してください。',ru:'Ошибка обработки GIF. Убедитесь, что файл не повреждён.'},
    'El fondo de previsualización debe pesar 2.5 MB o menos.':{en:'The preview background must be 2.5 MB or smaller.',fr:'Le fond d’aperçu doit faire 2,5 Mo ou moins.',pt:'O fundo da prévia deve ter no máximo 2,5 MB.',zh:'预览背景不得超过 2.5 MB。',ja:'プレビュー背景は2.5MB以下にしてください。',ru:'Фон предварительного просмотра должен быть не больше 2,5 МБ.'},
    'ZIP generado. Coste: 200 créditos (USD 2.00 de equivalencia).':{en:'ZIP generated. Cost: 200 credits (USD 2.00 equivalent).',fr:'ZIP généré. Coût : 200 crédits (équivalent à 2,00 USD).',pt:'ZIP gerado. Custo: 200 créditos (equivalente a US$ 2,00).',zh:'ZIP 已生成。费用：200 积分（相当于 2.00 美元）。',ja:'ZIPを生成しました。料金：200クレジット（2.00米ドル相当）。',ru:'ZIP создан. Стоимость: 200 кредитов (эквивалент 2,00 USD).'},
    'Pago aceptado. Verificando la suscripción…':{en:'Payment accepted. Verifying the subscription…',fr:'Paiement accepté. Vérification de l’abonnement…',pt:'Pagamento aceito. Verificando a assinatura…',zh:'付款已接受。正在验证订阅…',ja:'支払いが承認されました。サブスクリプションを確認中…',ru:'Платёж принят. Проверяем подписку…'},
    'No puedes suspender tu propia cuenta de administrador.':{en:'You cannot suspend your own administrator account.',fr:'Vous ne pouvez pas suspendre votre propre compte administrateur.',pt:'Você não pode suspender sua própria conta de administrador.',zh:'你不能暂停自己的管理员账户。',ja:'自分の管理者アカウントを停止することはできません。',ru:'Нельзя заблокировать собственную учётную запись администратора.'}
  };
  Object.assign(T, {
  "RM Skin Studio · área personal": {
    "en": "RM Skin Studio · personal area",
    "fr": "RM Skin Studio · espace personnel",
    "pt": "RM Skin Studio · área pessoal",
    "zh": "RM Skin Studio · 个人区域",
    "ja": "RM Skin Studio · マイページ",
    "ru": "RM Skin Studio · личный кабинет"
  },
  "Publicidad": {
    "en": "Advertising",
    "fr": "Publicité",
    "pt": "Publicidade",
    "zh": "广告",
    "ja": "広告",
    "ru": "Реклама"
  },
  "Privacidad": {
    "en": "Privacy",
    "fr": "Confidentialité",
    "pt": "Privacidade",
    "zh": "隐私",
    "ja": "プライバシー",
    "ru": "Конфиденциальность"
  },
  "Términos": {
    "en": "Terms",
    "fr": "Conditions",
    "pt": "Termos",
    "zh": "条款",
    "ja": "利用規約",
    "ru": "Условия"
  },
  "Admin": {
    "en": "Admin",
    "fr": "Administration",
    "pt": "Admin",
    "zh": "管理员",
    "ja": "管理者",
    "ru": "Администратор"
  },
  "Hola,": {
    "en": "Hello,",
    "fr": "Bonjour,",
    "pt": "Olá,",
    "zh": "你好，",
    "ja": "こんにちは、",
    "ru": "Здравствуйте,"
  },
  "creador": {
    "en": "creator",
    "fr": "créateur",
    "pt": "criador",
    "zh": "创作者",
    "ja": "クリエイター",
    "ru": "создатель"
  },
  "Continúa un diseño, explora las descargas listas o añade créditos a tu saldo.": {
    "en": "Continue a design, browse ready-made downloads, or add credits to your balance.",
    "fr": "Reprenez un design, explorez les téléchargements prêts à l’emploi ou ajoutez des crédits à votre solde.",
    "pt": "Continue um design, explore downloads prontos ou adicione créditos ao saldo.",
    "zh": "继续设计、浏览现成下载内容，或为余额充值。",
    "ja": "デザインを続ける、完成済みのダウンロードを探す、またはクレジットを追加できます。",
    "ru": "Продолжайте работу над дизайном, просматривайте готовые загрузки или пополните баланс."
  },
  "Billetera": {
    "en": "Wallet",
    "fr": "Portefeuille",
    "pt": "Carteira",
    "zh": "钱包",
    "ja": "ウォレット",
    "ru": "Кошелёк"
  },
  "Cantidad de créditos (100–10.000)": {
    "en": "Credit amount (100–10,000)",
    "fr": "Quantité de crédits (100–10 000)",
    "pt": "Quantidade de créditos (100–10.000)",
    "zh": "积分数量（100–10,000）",
    "ja": "クレジット数（100～10,000）",
    "ru": "Количество кредитов (100–10 000)"
  },
  "100 créditos = $1.00 USD. Límite de compra: $100.00 USD por transacción.": {
    "en": "100 credits = $1.00 USD. Purchase limit: $100.00 USD per transaction.",
    "fr": "100 crédits = 1,00 $ US. Limite d’achat : 100,00 $ US par transaction.",
    "pt": "100 créditos = US$ 1,00. Limite por compra: US$ 100,00 por transação.",
    "zh": "100 积分 = 1.00 美元。每笔交易限额：100.00 美元。",
    "ja": "100クレジット＝1.00米ドル。1回の購入上限：100.00米ドル。",
    "ru": "100 кредитов = 1,00 USD. Лимит покупки: 100,00 USD за транзакцию."
  },
  "Área personal": {
    "en": "Personal area",
    "fr": "Espace personnel",
    "pt": "Área pessoal",
    "zh": "个人区域",
    "ja": "マイページ",
    "ru": "Личный кабинет"
  },
  "Tus Descargables.": {
    "en": "Your downloads.",
    "fr": "Vos téléchargements.",
    "pt": "Seus downloads.",
    "zh": "你的下载内容。",
    "ja": "ダウンロード一覧",
    "ru": "Ваши загрузки."
  },
  "Aquí encontrarás los diseños que has adquirido del catálogo y los paquetes exportados desde tus estudios.": {
    "en": "Here you will find designs purchased from the catalog and packages exported from your studios.",
    "fr": "Vous trouverez ici les designs achetés dans le catalogue et les archives exportées depuis vos studios.",
    "pt": "Aqui você encontrará designs comprados no catálogo e pacotes exportados dos estúdios.",
    "zh": "这里可以找到从目录购买的设计和从工作室导出的压缩包。",
    "ja": "カタログで購入したデザインや、各スタジオからエクスポートしたパッケージが表示されます。",
    "ru": "Здесь находятся дизайны, приобретённые в каталоге, и архивы, экспортированные из студий."
  },
  "Cuenta": {
    "en": "Account",
    "fr": "Compte",
    "pt": "Conta",
    "zh": "账户",
    "ja": "アカウント",
    "ru": "Аккаунт"
  },
  "Ajustes de usuario": {
    "en": "User settings",
    "fr": "Paramètres utilisateur",
    "pt": "Configurações do usuário",
    "zh": "用户设置",
    "ja": "ユーザー設定",
    "ru": "Настройки пользователя"
  },
  "Gestiona tu perfil, contraseña y preferencias.": {
    "en": "Manage your profile, password, and preferences.",
    "fr": "Gérez votre profil, votre mot de passe et vos préférences.",
    "pt": "Gerencie seu perfil, senha e preferências.",
    "zh": "管理个人资料、密码和偏好设置。",
    "ja": "プロフィール、パスワード、設定を管理します。",
    "ru": "Управляйте профилем, паролем и предпочтениями."
  },
  "Datos de la cuenta": {
    "en": "Account details",
    "fr": "Détails du compte",
    "pt": "Dados da conta",
    "zh": "账户详情",
    "ja": "アカウント情報",
    "ru": "Данные аккаунта"
  },
  "El correo y la identidad se gestionan de forma segura con Firebase.": {
    "en": "Email and identity are securely managed with Firebase.",
    "fr": "L’adresse e-mail et l’identité sont gérées en toute sécurité par Firebase.",
    "pt": "O e-mail e a identidade são gerenciados com segurança pelo Firebase.",
    "zh": "邮箱和身份由 Firebase 安全管理。",
    "ja": "メールアドレスと本人確認は Firebase によって安全に管理されます。",
    "ru": "Электронная почта и личность безопасно управляются через Firebase."
  },
  "Saldo de créditos": {
    "en": "Credit balance",
    "fr": "Solde de crédits",
    "pt": "Saldo de créditos",
    "zh": "积分余额",
    "ja": "クレジット残高",
    "ru": "Баланс кредитов"
  },
  "Fecha de creación": {
    "en": "Created on",
    "fr": "Date de création",
    "pt": "Data de criação",
    "zh": "创建日期",
    "ja": "作成日",
    "ru": "Дата создания"
  },
  "Tu nombre público se sincroniza con D1.": {
    "en": "Your public name is synced with D1.",
    "fr": "Votre nom public est synchronisé avec D1.",
    "pt": "Seu nome público é sincronizado com o D1.",
    "zh": "你的公开名称会同步到 D1。",
    "ja": "公開名は D1 と同期されます。",
    "ru": "Ваше публичное имя синхронизируется с D1."
  },
  "Para proteger tu cuenta, Firebase volverá a autenticarte antes de cambiar la contraseña. Solo aparece para cuentas que utilizan correo y contraseña.": {
    "en": "For your security, Firebase reauthenticates you before changing the password. This is available only for email/password accounts.",
    "fr": "Pour protéger votre compte, Firebase vous réauthentifie avant le changement de mot de passe. Cette option est réservée aux comptes e-mail/mot de passe.",
    "pt": "Para sua segurança, o Firebase autentica você novamente antes de alterar a senha. Disponível apenas para contas de e-mail e senha.",
    "zh": "为保护账户，Firebase 会在修改密码前重新验证身份。此功能仅适用于邮箱/密码账户。",
    "ja": "安全のため、パスワード変更前に Firebase が再認証します。メール/パスワード方式のアカウントのみ利用できます。",
    "ru": "Для защиты аккаунта Firebase повторно проверит личность перед сменой пароля. Доступно только для аккаунтов с электронной почтой и паролем."
  },
  "Esta cuenta inició sesión con Google y no tiene una contraseña de correo establecida. Utiliza la recuperación de contraseña de Firebase o añade el proveedor Email/Password desde el flujo de cuenta admitido.": {
    "en": "This account signed in with Google and has no email password set. Use Firebase password recovery or add the Email/Password provider through the supported account flow.",
    "fr": "Ce compte utilise Google et ne possède pas de mot de passe e-mail. Utilisez la récupération Firebase ou ajoutez le fournisseur e-mail/mot de passe via le parcours de compte pris en charge.",
    "pt": "Esta conta entrou com o Google e não tem senha de e-mail configurada. Use a recuperação de senha do Firebase ou adicione o provedor e-mail/senha pelo fluxo compatível.",
    "zh": "此账户通过 Google 登录，尚未设置邮箱密码。请使用 Firebase 密码找回功能，或通过支持的账户流程添加邮箱/密码提供方。",
    "ja": "このアカウントは Google でログインしており、メールパスワードが設定されていません。Firebase のパスワード再設定を利用するか、対応するアカウント手順でメール/パスワード認証を追加してください。",
    "ru": "Этот аккаунт использует Google и не имеет пароля электронной почты. Используйте восстановление пароля Firebase или добавьте вход по электронной почте и паролю через поддерживаемый процесс."
  },
  "Preferencias": {
    "en": "Preferences",
    "fr": "Préférences",
    "pt": "Preferências",
    "zh": "偏好设置",
    "ja": "設定",
    "ru": "Предпочтения"
  },
  "Se guarda en este navegador mediante localStorage (rmss_lang).": {
    "en": "Saved in this browser using localStorage (rmss_lang).",
    "fr": "Enregistré dans ce navigateur via localStorage (rmss_lang).",
    "pt": "Salvo neste navegador usando localStorage (rmss_lang).",
    "zh": "通过 localStorage (rmss_lang) 保存在此浏览器中。",
    "ja": "localStorage (rmss_lang) を使ってこのブラウザーに保存されます。",
    "ru": "Сохраняется в этом браузере через localStorage (rmss_lang)."
  },
  "Plan y anuncios": {
    "en": "Plan and ads",
    "fr": "Forfait et publicités",
    "pt": "Plano e anúncios",
    "zh": "套餐和广告",
    "ja": "プランと広告",
    "ru": "План и реклама"
  },
  "Consulta el plan activo y las ventajas de Premium.": {
    "en": "View your active plan and Premium benefits.",
    "fr": "Consultez votre forfait actif et les avantages Premium.",
    "pt": "Veja seu plano ativo e as vantagens do Premium.",
    "zh": "查看当前套餐和 Premium 权益。",
    "ja": "現在のプランと Premium の特典を確認できます。",
    "ru": "Посмотрите активный план и преимущества Premium."
  },
  "Volver al panel": {
    "en": "Back to dashboard",
    "fr": "Retour au tableau de bord",
    "pt": "Voltar ao painel",
    "zh": "返回控制面板",
    "ja": "ダッシュボードに戻る",
    "ru": "Вернуться на панель"
  },
  "Planes de uso": {
    "en": "Plans",
    "fr": "Offres",
    "pt": "Planos",
    "zh": "使用方案",
    "ja": "プラン",
    "ru": "Тарифы"
  },
  "Elige cómo crear.": {
    "en": "Choose how to create.",
    "fr": "Choisissez votre façon de créer.",
    "pt": "Escolha como criar.",
    "zh": "选择创作方式。",
    "ja": "制作方法を選びましょう。",
    "ru": "Выберите способ создания."
  },
  "Usa créditos para exportar y obtener descargables. Premium elimina los anuncios mientras la suscripción esté activa.": {
    "en": "Use credits to export and get downloads. Premium removes ads while the subscription is active.",
    "fr": "Utilisez des crédits pour exporter et obtenir des téléchargements. Premium supprime les publicités tant que l’abonnement est actif.",
    "pt": "Use créditos para exportar e obter downloads. O Premium remove anúncios enquanto a assinatura estiver ativa.",
    "zh": "使用积分导出并获取下载内容。订阅有效期间，Premium 会移除广告。",
    "ja": "クレジットを使ってエクスポートやダウンロードを利用できます。Premium は有効期間中に広告を非表示にします。",
    "ru": "Используйте кредиты для экспорта и загрузок. Premium убирает рекламу на время действия подписки."
  },
  "Plan estándar": {
    "en": "Standard plan",
    "fr": "Offre standard",
    "pt": "Plano padrão",
    "zh": "标准方案",
    "ja": "スタンダードプラン",
    "ru": "Стандартный план"
  },
  "/ mes": {
    "en": "/ month",
    "fr": "/ mois",
    "pt": "/ mês",
    "zh": "/月",
    "ja": "/月",
    "ru": "/ месяц"
  },
  "25 créditos de bienvenida al crear tu cuenta.": {
    "en": "25 welcome credits when you create an account.",
    "fr": "25 crédits de bienvenue à la création du compte.",
    "pt": "25 créditos de boas-vindas ao criar uma conta.",
    "zh": "创建账户即可获得 25 个欢迎积分。",
    "ja": "アカウント作成時にウェルカムクレジット25枚。",
    "ru": "25 приветственных кредитов при создании аккаунта."
  },
  "Acceso a los tres estudios.": {
    "en": "Access to all three studios.",
    "fr": "Accès aux trois studios.",
    "pt": "Acesso aos três estúdios.",
    "zh": "可使用三个工作室。",
    "ja": "3つのスタジオを利用できます。",
    "ru": "Доступ ко всем трём студиям."
  },
  "Exportar un proyecto cuesta 200 créditos ($2.00 USD de equivalencia).": {
    "en": "Exporting a project costs 200 credits (equivalent to $2.00 USD).",
    "fr": "Exporter un projet coûte 200 crédits (équivalent à 2,00 $ US).",
    "pt": "Exportar um projeto custa 200 créditos (equivalente a US$ 2,00).",
    "zh": "导出一个项目需要 200 积分（相当于 2.00 美元）。",
    "ja": "プロジェクトのエクスポートは200クレジット（2.00米ドル相当）です。",
    "ru": "Экспорт проекта стоит 200 кредитов (эквивалент 2,00 USD)."
  },
  "Los anuncios pueden mostrarse.": {
    "en": "Ads may be shown.",
    "fr": "Des publicités peuvent s’afficher.",
    "pt": "Anúncios podem ser exibidos.",
    "zh": "可能会显示广告。",
    "ja": "広告が表示される場合があります。",
    "ru": "Может отображаться реклама."
  },
  "Usar RM Skin Studio": {
    "en": "Use RM Skin Studio",
    "fr": "Utiliser RM Skin Studio",
    "pt": "Usar RM Skin Studio",
    "zh": "使用 RM Skin Studio",
    "ja": "RM Skin Studio を使う",
    "ru": "Использовать RM Skin Studio"
  },
  "Para creadores": {
    "en": "For creators",
    "fr": "Pour les créateurs",
    "pt": "Para criadores",
    "zh": "面向创作者",
    "ja": "クリエイター向け",
    "ru": "Для создателей"
  },
  "Oculta los contenedores de anuncios de RM Skin Studio.": {
    "en": "Hides RM Skin Studio ad containers.",
    "fr": "Masque les espaces publicitaires de RM Skin Studio.",
    "pt": "Oculta os espaços de anúncios do RM Skin Studio.",
    "zh": "隐藏 RM Skin Studio 的广告容器。",
    "ja": "RM Skin Studio の広告枠を非表示にします。",
    "ru": "Скрывает рекламные блоки RM Skin Studio."
  },
  "Mantiene tu cuenta, proyectos y créditos.": {
    "en": "Keeps your account, projects, and credits.",
    "fr": "Conserve votre compte, vos projets et vos crédits.",
    "pt": "Mantém sua conta, projetos e créditos.",
    "zh": "保留你的账户、项目和积分。",
    "ja": "アカウント、プロジェクト、クレジットは維持されます。",
    "ru": "Сохраняет аккаунт, проекты и кредиты."
  },
  "La suscripción se administra desde PayPal.": {
    "en": "The subscription is managed through PayPal.",
    "fr": "L’abonnement est géré via PayPal.",
    "pt": "A assinatura é gerenciada pelo PayPal.",
    "zh": "订阅通过 PayPal 管理。",
    "ja": "サブスクリプションは PayPal で管理されます。",
    "ru": "Подписка управляется через PayPal."
  },
  "Se renueva según las condiciones del plan y de PayPal.": {
    "en": "Renews according to the plan and PayPal terms.",
    "fr": "Se renouvelle selon les conditions du forfait et de PayPal.",
    "pt": "Renova conforme as condições do plano e do PayPal.",
    "zh": "根据套餐和 PayPal 条款续订。",
    "ja": "プランと PayPal の条件に従って更新されます。",
    "ru": "Продлевается согласно условиям плана и PayPal."
  },
  "La suscripción solo estará disponible cuando el plan mensual de USD 7.00 esté activo en PayPal y su ID se haya configurado en el Worker.": {
    "en": "The subscription is available only when the USD 7.00 monthly PayPal plan is active and its ID is configured in the Worker.",
    "fr": "L’abonnement ne sera disponible que lorsque le forfait PayPal mensuel de 7,00 USD sera actif et son ID configuré dans le Worker.",
    "pt": "A assinatura estará disponível somente quando o plano mensal PayPal de US$ 7,00 estiver ativo e seu ID configurado no Worker.",
    "zh": "只有在 PayPal 中启用每月 7.00 美元的套餐并在 Worker 中配置其 ID 后，才能订阅。",
    "ja": "月額7.00米ドルの PayPal プランが有効で、その ID が Worker に設定された場合にのみ登録できます。",
    "ru": "Подписка станет доступна, когда месячный план PayPal за 7,00 USD будет активен, а его ID будет настроен в Worker."
  },
  "Equivalencia de la economía: 100 créditos = $1.00 USD. Las exportaciones de los estudios cuestan 200 créditos ($2.00 USD). Los descargables del catálogo pueden tener un precio personalizado por el administrador; la ficha muestra su equivalencia según el mismo ratio.": {
    "en": "Economy ratio: 100 credits = $1.00 USD. Studio exports cost 200 credits ($2.00 USD). Catalog downloads can have a custom admin price; the page shows the equivalent amount using the same ratio.",
    "fr": "Ratio économique : 100 crédits = 1,00 $ US. Les exports des studios coûtent 200 crédits (2,00 $ US). Les téléchargements du catalogue peuvent avoir un prix personnalisé défini par l’administrateur ; l’équivalence utilise le même ratio.",
    "pt": "Proporção econômica: 100 créditos = US$ 1,00. Exportações dos estúdios custam 200 créditos (US$ 2,00). Downloads do catálogo podem ter preço personalizado definido pelo administrador; a equivalência usa a mesma proporção.",
    "zh": "经济比例：100 积分 = 1.00 美元。工作室导出需 200 积分（2.00 美元）。目录下载价格可由管理员自定义；页面使用同一比例显示等值金额。",
    "ja": "換算率：100クレジット＝1.00米ドル。スタジオのエクスポートは200クレジット（2.00米ドル）です。カタログのダウンロード価格は管理者が設定でき、同じ換算率で金額を表示します。",
    "ru": "Экономический коэффициент: 100 кредитов = 1,00 USD. Экспорт из студии стоит 200 кредитов (2,00 USD). Цена загрузки из каталога задаётся администратором; эквивалент рассчитывается по тому же коэффициенту."
  },
  "Administración restringida": {
    "en": "Restricted administration",
    "fr": "Administration restreinte",
    "pt": "Administração restrita",
    "zh": "限制管理",
    "ja": "管理者専用",
    "ru": "Ограниченное администрирование"
  },
  "Panel privado": {
    "en": "Private panel",
    "fr": "Panneau privé",
    "pt": "Painel privado",
    "zh": "私有面板",
    "ja": "プライベートパネル",
    "ru": "Закрытая панель"
  },
  "Acceso permitido únicamente a la cuenta de GitHub autorizada en Cloudflare. No uses un token personal de GitHub en esta página.": {
    "en": "Access is limited to the GitHub account authorized in Cloudflare. Do not use a personal GitHub token on this page.",
    "fr": "L’accès est réservé au compte GitHub autorisé dans Cloudflare. N’utilisez pas de jeton personnel GitHub sur cette page.",
    "pt": "O acesso é limitado à conta GitHub autorizada no Cloudflare. Não use token pessoal do GitHub nesta página.",
    "zh": "仅允许 Cloudflare 中授权的 GitHub 账户访问。不要在此页面使用个人 GitHub 令牌。",
    "ja": "Cloudflare で許可された GitHub アカウントのみアクセスできます。このページで GitHub 個人アクセストークンを使用しないでください。",
    "ru": "Доступ разрешён только аккаунту GitHub, авторизованному в Cloudflare. Не используйте здесь персональный токен GitHub."
  },
  "Control privado": {
    "en": "Private control",
    "fr": "Contrôle privé",
    "pt": "Controle privado",
    "zh": "私有控制",
    "ja": "プライベート管理",
    "ru": "Закрытое управление"
  },
  "Administración": {
    "en": "Administration",
    "fr": "Administration",
    "pt": "Administração",
    "zh": "管理",
    "ja": "管理",
    "ru": "Администрирование"
  },
  "Usuarios, proyectos, catálogo privado y copias cifradas.": {
    "en": "Users, projects, private catalog, and encrypted backups.",
    "fr": "Utilisateurs, projets, catalogue privé et sauvegardes chiffrées.",
    "pt": "Usuários, projetos, catálogo privado e backups criptografados.",
    "zh": "用户、项目、私有目录和加密备份。",
    "ja": "ユーザー、プロジェクト、非公開カタログ、暗号化バックアップ。",
    "ru": "Пользователи, проекты, закрытый каталог и зашифрованные резервные копии."
  },
  "Actualizar datos": {
    "en": "Refresh data",
    "fr": "Actualiser les données",
    "pt": "Atualizar dados",
    "zh": "刷新数据",
    "ja": "データを更新",
    "ru": "Обновить данные"
  },
  "Usuarios": {
    "en": "Users",
    "fr": "Utilisateurs",
    "pt": "Usuários",
    "zh": "用户",
    "ja": "ユーザー",
    "ru": "Пользователи"
  },
  "Proyectos": {
    "en": "Projects",
    "fr": "Projets",
    "pt": "Projetos",
    "zh": "项目",
    "ja": "プロジェクト",
    "ru": "Проекты"
  },
  "Catálogo / INI": {
    "en": "Catalog / INI",
    "fr": "Catalogue / INI",
    "pt": "Catálogo / INI",
    "zh": "目录 / INI",
    "ja": "カタログ / INI",
    "ru": "Каталог / INI"
  },
  "Copias de seguridad": {
    "en": "Backups",
    "fr": "Sauvegardes",
    "pt": "Backups",
    "zh": "备份",
    "ja": "バックアップ",
    "ru": "Резервные копии"
  },
  "Nunca se muestra la contraseña ni su hash en la tabla administrativa.": {
    "en": "Passwords and their hashes are never shown in the admin table.",
    "fr": "Les mots de passe et leurs empreintes ne sont jamais affichés dans le tableau d’administration.",
    "pt": "Senhas e hashes nunca são exibidos na tabela administrativa.",
    "zh": "管理表格不会显示密码或密码哈希。",
    "ja": "管理テーブルにはパスワードやハッシュを表示しません。",
    "ru": "Пароли и их хеши никогда не отображаются в административной таблице."
  },
  "Vista de metadatos y acceso privado a la configuración guardada.": {
    "en": "Metadata view and private access to saved configuration.",
    "fr": "Vue des métadonnées et accès privé à la configuration enregistrée.",
    "pt": "Visualização de metadados e acesso privado à configuração salva.",
    "zh": "元数据视图和对已保存配置的私有访问。",
    "ja": "メタデータ表示と保存済み設定への非公開アクセス。",
    "ru": "Просмотр метаданных и закрытый доступ к сохранённым настройкам."
  },
  "Detalle de proyecto": {
    "en": "Project details",
    "fr": "Détails du projet",
    "pt": "Detalhes do projeto",
    "zh": "项目详情",
    "ja": "プロジェクトの詳細",
    "ru": "Детали проекта"
  },
  "Cerrar": {
    "en": "Close",
    "fr": "Fermer",
    "pt": "Fechar",
    "zh": "关闭",
    "ja": "閉じる",
    "ru": "Закрыть"
  },
  "Crear o actualizar descargable": {
    "en": "Create or update download",
    "fr": "Créer ou mettre à jour un téléchargement",
    "pt": "Criar ou atualizar download",
    "zh": "创建或更新下载内容",
    "ja": "ダウンロード項目を作成または更新",
    "ru": "Создать или обновить загрузку"
  },
  "Sube el paquete original y, opcionalmente, varias variantes INI. Los originales permanecen en R2 privado; la tienda muestra una aproximación visual SVG o una captura de respaldo.": {
    "en": "Upload the original package and optional INI variants. Originals remain in private R2; the store shows an SVG visual approximation or a backup screenshot.",
    "fr": "Téléversez le paquet original et, éventuellement, plusieurs variantes INI. Les originaux restent dans R2 privé ; la boutique affiche une approximation SVG ou une capture de secours.",
    "pt": "Envie o pacote original e, opcionalmente, várias variantes INI. Os originais ficam no R2 privado; a loja mostra uma aproximação visual SVG ou uma captura de apoio.",
    "zh": "上传原始包以及可选的多个 INI 变体。原件保存在私有 R2；商店显示 SVG 近似预览或备用截图。",
    "ja": "元のパッケージと任意の INI バリアントをアップロードします。原本は非公開 R2 に保存し、ストアには SVG の概略表示または代替スクリーンショットを表示します。",
    "ru": "Загрузите исходный пакет и при необходимости варианты INI. Оригиналы хранятся в закрытом R2; магазин показывает визуальную SVG-аппроксимацию или резервный скриншот."
  },
  "Nombre público": {
    "en": "Public name",
    "fr": "Nom public",
    "pt": "Nome público",
    "zh": "公开名称",
    "ja": "公開名",
    "ru": "Публичное имя"
  },
  "Precio en créditos (0 o más, lo eliges tú)": {
    "en": "Price in credits (0 or more, your choice)",
    "fr": "Prix en crédits (0 ou plus, à votre choix)",
    "pt": "Preço em créditos (0 ou mais, você escolhe)",
    "zh": "积分价格（0 或更高，由你设置）",
    "ja": "クレジット価格（0以上、自由に設定）",
    "ru": "Цена в кредитах (0 или больше, на ваш выбор)"
  },
  "Equivale a $2.00 USD": {
    "en": "Equivalent to $2.00 USD",
    "fr": "Équivalent à 2,00 $ US",
    "pt": "Equivale a US$ 2,00",
    "zh": "相当于 2.00 美元",
    "ja": "2.00米ドル相当",
    "ru": "Эквивалент 2,00 USD"
  },
  "Descripción": {
    "en": "Description",
    "fr": "Description",
    "pt": "Descrição",
    "zh": "描述",
    "ja": "説明",
    "ru": "Описание"
  },
  "Fuente del descargable": {
    "en": "Download source",
    "fr": "Source du téléchargement",
    "pt": "Origem do download",
    "zh": "下载来源",
    "ja": "ダウンロード元",
    "ru": "Источник загрузки"
  },
  "Los archivos R2 son privados. Las URL externas son enlaces que el proveedor controla.": {
    "en": "R2 files are private. External URLs are links controlled by the provider.",
    "fr": "Les fichiers R2 sont privés. Les URL externes sont contrôlées par leur fournisseur.",
    "pt": "Os arquivos R2 são privados. URLs externas são links controlados pelo fornecedor.",
    "zh": "R2 文件为私有。外部 URL 由其提供方控制。",
    "ja": "R2 ファイルは非公開です。外部 URL は提供元が管理するリンクです。",
    "ru": "Файлы R2 закрыты. Внешние URL контролируются их поставщиком."
  },
  "URL de descarga externa": {
    "en": "External download URL",
    "fr": "URL de téléchargement externe",
    "pt": "URL externa de download",
    "zh": "外部下载 URL",
    "ja": "外部ダウンロード URL",
    "ru": "Внешний URL загрузки"
  },
  "Solo HTTPS, sin usuario, contraseña ni puerto personalizado.": {
    "en": "HTTPS only, with no username, password, or custom port.",
    "fr": "HTTPS uniquement, sans nom d’utilisateur, mot de passe ni port personnalisé.",
    "pt": "Somente HTTPS, sem usuário, senha ou porta personalizada.",
    "zh": "仅允许 HTTPS，不允许用户名、密码或自定义端口。",
    "ja": "HTTPS のみ。ユーザー名、パスワード、独自ポートは使用できません。",
    "ru": "Только HTTPS, без имени пользователя, пароля и нестандартного порта."
  },
  "Archivo original para descarga (.ini, .zip o .rmskin)": {
    "en": "Original download file (.ini, .zip, or .rmskin)",
    "fr": "Fichier original à télécharger (.ini, .zip ou .rmskin)",
    "pt": "Arquivo original para download (.ini, .zip ou .rmskin)",
    "zh": "原始下载文件（.ini、.zip 或 .rmskin）",
    "ja": "ダウンロード用オリジナルファイル（.ini、.zip、.rmskin）",
    "ru": "Исходный файл для загрузки (.ini, .zip или .rmskin)"
  },
  "Se guarda en R2 privado. Nunca se expone a visitantes antes de una compra autorizada.": {
    "en": "Stored in private R2. Never exposed to visitors before an authorized purchase.",
    "fr": "Stocké dans R2 privé. Jamais exposé aux visiteurs avant un achat autorisé.",
    "pt": "Salvo no R2 privado. Nunca é exposto aos visitantes antes de uma compra autorizada.",
    "zh": "保存在私有 R2 中。授权购买前不会向访客公开。",
    "ja": "非公開 R2 に保存され、承認済み購入前に訪問者へ公開されません。",
    "ru": "Хранится в закрытом R2 и не раскрывается посетителям до авторизованной покупки."
  },
  "Variantes del INI (opcional, puedes seleccionar varias)": {
    "en": "INI variants (optional; you can select multiple)",
    "fr": "Variantes INI (facultatif, sélection multiple possible)",
    "pt": "Variantes INI (opcional; você pode selecionar várias)",
    "zh": "INI 变体（可选，可多选）",
    "ja": "INI バリアント（任意、複数選択可能）",
    "ru": "Варианты INI (необязательно, можно выбрать несколько)"
  },
  "Cada INI se guarda como variante privada. El nombre del archivo se usa como etiqueta editable en el futuro.": {
    "en": "Each INI is stored as a private variant. The filename is used as its label.",
    "fr": "Chaque INI est stocké comme variante privée. Le nom du fichier sert d’étiquette.",
    "pt": "Cada INI é salvo como variante privada. O nome do arquivo é usado como rótulo.",
    "zh": "每个 INI 都作为私有变体保存。文件名将用作标签。",
    "ja": "各 INI は非公開バリアントとして保存され、ファイル名がラベルになります。",
    "ru": "Каждый INI сохраняется как закрытый вариант. Имя файла используется как метка."
  },
  "Captura de respaldo de Rainmeter (opcional)": {
    "en": "Rainmeter fallback screenshot (optional)",
    "fr": "Capture de secours Rainmeter (facultative)",
    "pt": "Captura de apoio do Rainmeter (opcional)",
    "zh": "Rainmeter 备用截图（可选）",
    "ja": "Rainmeter の代替スクリーンショット（任意）",
    "ru": "Резервный скриншот Rainmeter (необязательно)"
  },
  "PNG/JPG/WebP, máximo 3 MB. Se usa si el skin complejo no se representa bien con el renderizador automático.": {
    "en": "PNG/JPG/WebP, 3 MB maximum. Used when a complex skin cannot be rendered accurately automatically.",
    "fr": "PNG/JPG/WebP, 3 Mo maximum. Utilisée si le rendu automatique d’un skin complexe est imprécis.",
    "pt": "PNG/JPG/WebP, máximo de 3 MB. Usada quando um skin complexo não é renderizado corretamente automaticamente.",
    "zh": "PNG/JPG/WebP，最大 3 MB。复杂皮肤无法自动准确渲染时使用。",
    "ja": "PNG/JPG/WebP、最大3MB。複雑なスキンを自動レンダラーで正確に表示できない場合に使用します。",
    "ru": "PNG/JPG/WebP, максимум 3 МБ. Используется, если сложный скин некорректно отображается автоматически."
  },
  "Descripción visual alternativa (opcional)": {
    "en": "Alternative visual description (optional)",
    "fr": "Description visuelle alternative (facultative)",
    "pt": "Descrição visual alternativa (opcional)",
    "zh": "备用视觉描述（可选）",
    "ja": "代替の視覚的説明（任意）",
    "ru": "Альтернативное визуальное описание (необязательно)"
  },
  "La tienda no mostrará el código fuente. Genera una aproximación SVG estática de los medidores compatibles; Lua, plugins, audio y recursos externos requieren captura de respaldo.": {
    "en": "The store will not show source code. Compatible meters are rendered as a static SVG approximation; Lua, plugins, audio, and external resources require a fallback screenshot.",
    "fr": "La boutique n’affiche pas le code source. Les compteurs compatibles sont approximés en SVG statique ; Lua, les plugins, l’audio et les ressources externes nécessitent une capture de secours.",
    "pt": "A loja não exibirá o código-fonte. Medidores compatíveis são aproximados em SVG estático; Lua, plugins, áudio e recursos externos exigem uma captura de apoio.",
    "zh": "商店不会显示源代码。兼容的仪表会生成静态 SVG 近似图；Lua、插件、音频和外部资源需要备用截图。",
    "ja": "ストアにソースコードは表示されません。対応メーターは静的 SVG で近似表示します。Lua、プラグイン、音声、外部リソースには代替スクリーンショットが必要です。",
    "ru": "Магазин не показывает исходный код. Совместимые измерители отображаются как статическая SVG-аппроксимация; Lua, плагины, аудио и внешние ресурсы требуют резервного скриншота."
  },
  "Visibilidad": {
    "en": "Visibility",
    "fr": "Visibilité",
    "pt": "Visibilidade",
    "zh": "可见性",
    "ja": "公開状態",
    "ru": "Видимость"
  },
  "Guardar descargable": {
    "en": "Save download",
    "fr": "Enregistrer le téléchargement",
    "pt": "Salvar download",
    "zh": "保存下载项",
    "ja": "ダウンロード項目を保存",
    "ru": "Сохранить загрузку"
  },
  "Limpiar formulario": {
    "en": "Clear form",
    "fr": "Effacer le formulaire",
    "pt": "Limpar formulário",
    "zh": "清空表单",
    "ja": "フォームをクリア",
    "ru": "Очистить форму"
  },
  "Catálogo actual": {
    "en": "Current catalog",
    "fr": "Catalogue actuel",
    "pt": "Catálogo atual",
    "zh": "当前目录",
    "ja": "現在のカタログ",
    "ru": "Текущий каталог"
  },
  "Plantillas privadas": {
    "en": "Private templates",
    "fr": "Modèles privés",
    "pt": "Modelos privados",
    "zh": "私有模板",
    "ja": "非公開テンプレート",
    "ru": "Закрытые шаблоны"
  },
  "La base de datos y los objetos de R2 se guardan cifrados con AES-256-GCM. La copia contiene hashes y sales, nunca contraseñas legibles.": {
    "en": "The database and R2 objects are backed up with AES-256-GCM encryption. Backups contain hashes and salts, never readable passwords.",
    "fr": "La base de données et les objets R2 sont sauvegardés avec le chiffrement AES-256-GCM. Les copies contiennent des empreintes et des sels, jamais les mots de passe en clair.",
    "pt": "O banco e os objetos R2 são armazenados em backups criptografados com AES-256-GCM. As cópias contêm hashes e salts, nunca senhas legíveis.",
    "zh": "数据库和 R2 对象使用 AES-256-GCM 加密备份。备份只包含哈希和盐值，不包含明文密码。",
    "ja": "データベースと R2 オブジェクトは AES-256-GCM で暗号化してバックアップされます。バックアップにはハッシュとソルトのみが含まれ、平文パスワードは含まれません。",
    "ru": "База данных и объекты R2 резервируются с шифрованием AES-256-GCM. Копии содержат хеши и соли, но не пароли в открытом виде."
  },
  "Crear copia ahora": {
    "en": "Create backup now",
    "fr": "Créer une sauvegarde maintenant",
    "pt": "Criar backup agora",
    "zh": "立即创建备份",
    "ja": "今すぐバックアップ",
    "ru": "Создать резервную копию"
  },
  "Para que exista una copia diaria automática, despliega también el Worker programado descrito en README.md.": {
    "en": "For automatic daily backups, also deploy the scheduled Worker described in README.md.",
    "fr": "Pour des sauvegardes quotidiennes automatiques, déployez aussi le Worker planifié décrit dans README.md.",
    "pt": "Para backups diários automáticos, implante também o Worker agendado descrito no README.md.",
    "zh": "要启用每日自动备份，还需部署 README.md 中描述的定时 Worker。",
    "ja": "毎日の自動バックアップには、README.md に記載されたスケジュール Worker もデプロイしてください。",
    "ru": "Для ежедневного автоматического резервного копирования разверните также плановый Worker из README.md."
  },
  "Actividad del usuario": {
    "en": "User activity",
    "fr": "Activité utilisateur",
    "pt": "Atividade do usuário",
    "zh": "用户活动",
    "ja": "ユーザーのアクティビティ",
    "ru": "Активность пользователя"
  },
  "Últimos eventos": {
    "en": "Recent events",
    "fr": "Événements récents",
    "pt": "Eventos recentes",
    "zh": "最近事件",
    "ja": "最近のイベント",
    "ru": "Последние события"
  },
  "Selecciona un usuario para consultar su actividad.": {
    "en": "Select a user to view their activity.",
    "fr": "Sélectionnez un utilisateur pour consulter son activité.",
    "pt": "Selecione um usuário para ver sua atividade.",
    "zh": "选择用户以查看其活动。",
    "ja": "ユーザーを選択するとアクティビティを確認できます。",
    "ru": "Выберите пользователя, чтобы просмотреть его активность."
  },
  "Panel privado de RM Skin Studio.": {
    "en": "RM Skin Studio private panel.",
    "fr": "Panneau privé de RM Skin Studio.",
    "pt": "Painel privado do RM Skin Studio.",
    "zh": "RM Skin Studio 私有面板。",
    "ja": "RM Skin Studio のプライベートパネル。",
    "ru": "Закрытая панель RM Skin Studio."
  },
  "PANEL IZQUIERDO (Controles)": {
    "en": "LEFT PANEL (Controls)",
    "fr": "PANNEAU GAUCHE (Commandes)",
    "pt": "PAINEL ESQUERDO (Controles)",
    "zh": "左侧面板（控件）",
    "ja": "左パネル（操作）",
    "ru": "ЛЕВАЯ ПАНЕЛЬ (Управление)"
  },
  "SELECCIONAR GIF": {
    "en": "SELECT GIF",
    "fr": "SÉLECTIONNER UN GIF",
    "pt": "SELECIONAR GIF",
    "zh": "选择 GIF",
    "ja": "GIFを選択",
    "ru": "ВЫБРАТЬ GIF"
  },
  "NOMBRE DEL PROYECTO": {
    "en": "PROJECT NAME",
    "fr": "NOM DU PROJET",
    "pt": "NOME DO PROJETO",
    "zh": "项目名称",
    "ja": "プロジェクト名",
    "ru": "НАЗВАНИЕ ПРОЕКТА"
  },
  "VELOCIDAD DE REPRODUCCIÓN (FPS)": {
    "en": "PLAYBACK SPEED (FPS)",
    "fr": "VITESSE DE LECTURE (FPS)",
    "pt": "VELOCIDADE DE REPRODUÇÃO (FPS)",
    "zh": "播放速度 (FPS)",
    "ja": "再生速度 (FPS)",
    "ru": "СКОРОСТЬ ВОСПРОИЗВЕДЕНИЯ (FPS)"
  },
  "Ajusta el control para ver los cambios en tiempo real en la pantalla de la derecha.": {
    "en": "Adjust the control to see changes in real time on the right screen.",
    "fr": "Réglez le contrôle pour voir les changements en temps réel à droite.",
    "pt": "Ajuste o controle para ver as alterações em tempo real na tela à direita.",
    "zh": "调整控件即可在右侧屏幕实时查看变化。",
    "ja": "コントロールを調整すると右側の画面に変更がリアルタイムで表示されます。",
    "ru": "Настройте параметры, чтобы видеть изменения в реальном времени на экране справа."
  },
  "Exportar Widget (.zip)": {
    "en": "Export Widget (.zip)",
    "fr": "Exporter le widget (.zip)",
    "pt": "Exportar widget (.zip)",
    "zh": "导出小组件 (.zip)",
    "ja": "ウィジェットをエクスポート (.zip)",
    "ru": "Экспорт виджета (.zip)"
  },
  "Barra de Progreso": {
    "en": "Progress bar",
    "fr": "Barre de progression",
    "pt": "Barra de progresso",
    "zh": "进度条",
    "ja": "進行状況バー",
    "ru": "Индикатор выполнения"
  },
  "Procesando fotogramas...": {
    "en": "Processing frames...",
    "fr": "Traitement des images...",
    "pt": "Processando quadros...",
    "zh": "正在处理帧...",
    "ja": "フレームを処理中...",
    "ru": "Обработка кадров..."
  },
  "PANEL DERECHO (Previsualización)": {
    "en": "RIGHT PANEL (Preview)",
    "fr": "PANNEAU DROIT (Aperçu)",
    "pt": "PAINEL DIREITO (Prévia)",
    "zh": "右侧面板（预览）",
    "ja": "右パネル（プレビュー）",
    "ru": "ПРАВАЯ ПАНЕЛЬ (Предпросмотр)"
  },
  "Esperando archivo .gif...": {
    "en": "Waiting for .gif file...",
    "fr": "En attente du fichier .gif...",
    "pt": "Aguardando arquivo .gif...",
    "zh": "等待 .gif 文件...",
    "ja": ".gif ファイルを待機中...",
    "ru": "Ожидание файла .gif..."
  },
  "Generación en servidor": {
    "en": "Server-side generation",
    "fr": "Génération côté serveur",
    "pt": "Geração no servidor",
    "zh": "服务器端生成",
    "ja": "サーバー側で生成",
    "ru": "Генерация на сервере"
  },
  "El código .ini no se muestra ni se edita en el navegador. Al exportar, la plantilla se procesa en el servidor después de verificar tu sesión y tus créditos.": {
    "en": "The .ini source is not shown or edited in the browser. On export, the template is processed on the server after your session and credits are verified.",
    "fr": "Le code .ini n’est ni affiché ni modifié dans le navigateur. À l’export, le modèle est traité sur le serveur après vérification de votre session et de vos crédits.",
    "pt": "O código .ini não é exibido nem editado no navegador. Na exportação, o modelo é processado no servidor após a verificação da sessão e dos créditos.",
    "zh": "浏览器不会显示或编辑 .ini 源码。导出时，服务器会在验证会话和积分后处理模板。",
    "ja": ".ini ソースはブラウザーに表示・編集されません。エクスポート時にセッションとクレジットを検証してからサーバーでテンプレートを処理します。",
    "ru": "Код .ini не отображается и не редактируется в браузере. При экспорте шаблон обрабатывается на сервере после проверки сеанса и кредитов."
  },
  "Cómo funciona": {
    "en": "How it works",
    "fr": "Fonctionnement",
    "pt": "Como funciona",
    "zh": "工作原理",
    "ja": "使い方",
    "ru": "Как это работает"
  },
  "Ajusta la apariencia.": {
    "en": "Adjust the appearance.",
    "fr": "Ajustez l’apparence.",
    "pt": "Ajuste a aparência.",
    "zh": "调整外观。",
    "ja": "外観を調整します。",
    "ru": "Настройте внешний вид."
  },
  "Guarda el proyecto en tu cuenta.": {
    "en": "Save the project to your account.",
    "fr": "Enregistrez le projet dans votre compte.",
    "pt": "Salve o projeto na sua conta.",
    "zh": "将项目保存到你的账户。",
    "ja": "プロジェクトをアカウントに保存します。",
    "ru": "Сохраните проект в аккаунте."
  },
  "Exporta el ZIP con créditos suficientes.": {
    "en": "Export the ZIP with enough credits.",
    "fr": "Exportez le ZIP avec suffisamment de crédits.",
    "pt": "Exporte o ZIP com créditos suficientes.",
    "zh": "积分充足后即可导出 ZIP。",
    "ja": "十分なクレジットがあれば ZIP をエクスポートします。",
    "ru": "Экспортируйте ZIP при достаточном количестве кредитов."
  },
  "El precio de exportación de Calendar Studio es de 200 créditos ($2.00 USD de equivalencia).": {
    "en": "Calendar Studio export costs 200 credits (equivalent to $2.00 USD).",
    "fr": "L’export de Calendar Studio coûte 200 crédits (équivalent à 2,00 $ US).",
    "pt": "A exportação do Calendar Studio custa 200 créditos (equivalente a US$ 2,00).",
    "zh": "Calendar Studio 导出需 200 积分（相当于 2.00 美元）。",
    "ja": "Calendar Studio のエクスポートは200クレジット（2.00米ドル相当）です。",
    "ru": "Экспорт Calendar Studio стоит 200 кредитов (эквивалент 2,00 USD)."
  },
  "Rellenar": {
    "en": "Fill",
    "fr": "Remplir",
    "pt": "Preencher",
    "zh": "填充",
    "ja": "塗りつぶし",
    "ru": "Заполнить"
  },
  "Ajustar": {
    "en": "Fit",
    "fr": "Ajuster",
    "pt": "Ajustar",
    "zh": "适应",
    "ja": "フィット",
    "ru": "Подогнать"
  },
  "Añade un fondo y empieza a crear": {
    "en": "Add a background and start creating",
    "fr": "Ajoutez un fond et commencez à créer",
    "pt": "Adicione um fundo e comece a criar",
    "zh": "添加背景并开始创作",
    "ja": "背景を追加して作成を始めましょう",
    "ru": "Добавьте фон и начните создавать"
  },
  "Propiedades": {
    "en": "Properties",
    "fr": "Propriétés",
    "pt": "Propriedades",
    "zh": "属性",
    "ja": "プロパティ",
    "ru": "Свойства"
  },
  "Exportación": {
    "en": "Export",
    "fr": "Exportation",
    "pt": "Exportação",
    "zh": "导出",
    "ja": "エクスポート",
    "ru": "Экспорт"
  },
  "Selecciona un widget para editar.": {
    "en": "Select a widget to edit.",
    "fr": "Sélectionnez un widget à modifier.",
    "pt": "Selecione um widget para editar.",
    "zh": "选择要编辑的小组件。",
    "ja": "編集するウィジェットを選択してください。",
    "ru": "Выберите виджет для редактирования."
  },
  "(Puedes presionar Supr / Delete para borrar)": {
    "en": "(Press Delete to remove)",
    "fr": "(Appuyez sur Suppr/Delete pour supprimer)",
    "pt": "(Pressione Delete para remover)",
    "zh": "（按 Delete 键删除）",
    "ja": "（Delete キーで削除できます）",
    "ru": "(Нажмите Delete, чтобы удалить)"
  },
  "Eliminar Widget (Tecla Supr)": {
    "en": "Remove widget (Delete key)",
    "fr": "Supprimer le widget (touche Suppr)",
    "pt": "Remover widget (tecla Delete)",
    "zh": "删除小组件（Delete 键）",
    "ja": "ウィジェットを削除（Deleteキー）",
    "ru": "Удалить виджет (клавиша Delete)"
  },
  "Exportación segura": {
    "en": "Secure export",
    "fr": "Exportation sécurisée",
    "pt": "Exportação segura",
    "zh": "安全导出",
    "ja": "安全なエクスポート",
    "ru": "Безопасный экспорт"
  }
});
  const lookup = new Map(Object.keys(T).map(source => [source, source]));
  for (const [source, values] of Object.entries(T)) for (const [lang, value] of Object.entries(values)) lookup.set(`${lang}\0${value}`, source);
  const nodeSource = new WeakMap(); const nodeRendered = new WeakMap(); const attrSource = new WeakMap();
  const storageKey = 'rmss_lang';
  let lang = (() => { try { const candidate = localStorage.getItem(storageKey); return LANGS.includes(candidate) ? candidate : 'es'; } catch { return 'es'; } })();
  let observer;
  function sourceFor(value, node) {
    if (nodeSource.has(node) && nodeRendered.get(node) === value) return nodeSource.get(node);
    return lookup.get(`${lang}\0${value.trim()}`) || value.trim();
  }
  function translateText(node) {
    const parent = node.parentElement;
    if (!parent || /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|CODE|PRE|OPTION)$/.test(parent.tagName) || parent.closest('[contenteditable="true"],.no-i18n,.rmss-lang-toggle')) return;
    const raw = node.nodeValue || '';
    if (!raw.trim()) return;
    const prefix = raw.match(/^\s*/)?.[0] || ''; const suffix = raw.match(/\s*$/)?.[0] || '';
    const source = sourceFor(raw.trim(), node);
    const translated = (T[source] && T[source][lang]) || source;
    const result = prefix + translated + suffix;
    nodeSource.set(node, source); nodeRendered.set(node, result);
    if (node.nodeValue !== result) node.nodeValue = result;
  }
  function translateAttributes(el) {
    for (const attr of ['placeholder','title','aria-label','data-i18n-title']) {
      if (!el.hasAttribute(attr)) continue;
      const value = el.getAttribute(attr) || '';
      const cacheKey = `${attr}:${value}`;
      let source = attrSource.get(el)?.[attr];
      if (!source || source.rendered !== value) {
        source = { original: lookup.get(`${lang}\0${value}`) || value, rendered: value };
        const record = attrSource.get(el) || {}; record[attr] = source; attrSource.set(el, record);
      }
      const translated = (T[source.original] && T[source.original][lang]) || source.original;
      el.setAttribute(attr, translated);
      const record = attrSource.get(el) || {}; record[attr] = { original: source.original, rendered: translated }; attrSource.set(el, record);
    }
  }
  function translateTree(root=document.body) {
    if (!root) return;
    const elements = root.nodeType === 1 ? [root, ...root.querySelectorAll('*')] : [...root.querySelectorAll('*')];
    for (const el of elements) translateAttributes(el);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(translateText);
    document.documentElement.lang = ({es:'es',en:'en',fr:'fr',pt:'pt',zh:'zh-CN',ja:'ja-JP',ru:'ru'})[lang] || 'es';
    document.querySelectorAll('.rmss-lang-toggle').forEach(button => { button.textContent = lang.toUpperCase(); button.setAttribute('aria-label', `Language: ${NAMES[lang]}`); button.title = `Language: ${NAMES[lang]}`; });
    document.querySelectorAll('[data-language-select]').forEach(select => { if (select.value !== lang) select.value = lang; });
  }
  function setLanguage(next) {
    if (!LANGS.includes(next)) next = 'es';
    lang = next;
    try { localStorage.setItem(storageKey, lang); } catch {}
    translateTree(document.body);
    window.dispatchEvent(new CustomEvent('rmss:languagechange', { detail: { lang } }));
  }
  function cycle() { setLanguage(LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length]); }
  document.addEventListener('click', event => { const button = event.target.closest('.rmss-lang-toggle'); if (button) { event.preventDefault(); cycle(); } });
  document.addEventListener('change', event => { if (event.target.matches('[data-language-select]')) setLanguage(event.target.value); });
  window.RMSSLanguage = { languages: LANGS.slice(), names: { ...NAMES }, get: () => lang, set: setLanguage, cycle, t: (source) => (T[source] && T[source][lang]) || source };
  translateTree(document.body);
  observer = new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'characterData') translateText(record.target);
      else for (const node of record.addedNodes) if (node.nodeType === 1) translateTree(node); else if (node.nodeType === 3) translateText(node);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  const originalAlert = window.alert.bind(window);
  window.alert = message => originalAlert(window.RMSSLanguage.t(String(message)));
})();
