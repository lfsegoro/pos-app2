export function createKeypad(
  container,
  onPress
) {

  const keys = [

    '1','2','3',
    '4','5','6',
    '7','8','9',
    'C','0','OK'

  ];

  keys.forEach(key => {

    const btn =
      document.createElement(
        'button'
      );

    btn.textContent = key;

    btn.addEventListener(
      'click',
      () => onPress(key)
    );

    container.appendChild(btn);

  });

}