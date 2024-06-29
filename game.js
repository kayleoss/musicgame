$(document).ready(function(){

    $('.showkeys').hide();
    $('.scoreboard').hide();
    $('.giveupbutton').hide();
    $('body').css("background-image", "url('assets/main.PNG')")

    $('button.song-button').on('click', function() {
        vcx =  $(this).attr('id') 
        startGame(vcx);
    })

    function startGame(song) {
        $('.gamehide').hide();
        $('.gameshow').show();

        let bgImg = "url('assets/" + song + ".jpg')"
        let audioSource;
        let analyser;
        let score = 0;

        $('body').css("background-image", bgImg)

        fetch('https://musicgamebackend.vercel.app/songs/' + song)
            .then(res => res.json())
            .then(data => {
                songAudio = new Audio("data:audio/wav;base64," + data);
                songContext = new AudioContext();

                songAudio.play();
                $('#score').text(score)
                
                audioSource = songContext.createMediaElementSource(songAudio);
                analyser = songContext.createAnalyser();
                audioSource.connect(analyser);
                analyser.connect(songContext.destination);
                analyser.fftSize = 64;
                let bpmConverted;

                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);

                window.addEventListener('keypress', function(e) {
                    if (e.key === $('.showkeys > p:last').data('key') && !$('.showkeys > p:last').hasClass('evaluated')) {
                        writeScore(50)
                        $('.showkeys > p:last').addClass('evaluated')
                        $('.showkeys > p:last').css("background", "rgba(2, 143, 2, 0.65)")
                    } else {
                        if (!$('.showkeys > p:last').hasClass('evaluated')) {
                            writeScore(-50)
                            $('.showkeys > p:last').addClass('evaluated')
                            $('.showkeys > p:last').css("background", "rgba(231, 36, 0, 0.65)")
                        }
                    }
                })

                function playNotes() {
                    analyser.getByteFrequencyData(dataArray)
                    let key = 0;
                    for (i=0; i<bufferLength; i++) {
                        key += dataArray[i];
                    }

                    if ($('.showkeys').children().length >= 4) {
                        $('.showkeys').empty();
                    }

                    console.log(key)
                    if (key > 2000 && key <= 3800) {
                        const el = '<p class="neutral" data-key="f">F</p>'
                        $('.showkeys').append(el)
                        key = 0;
                    }
                    if (key > 3800 && key <= 4000) {
                        $('.showkeys').append('<p class="neutral" data-key="g">G</p>')
                        key = 0;
                    }
                    if (key > 4000 && key <= 4200) {
                        $('.showkeys').append('<p class="neutral" data-key="r">R</p>')
                        key = 0;
                    }
                    if (key > 4200 && key <= 4500) {
                        $('.showkeys').append('<p class="neutral" data-key="w">W</p>')
                        key = 0;
                    }
                    if (key > 4500 && key <= 5000) {
                        $('.showkeys').append('<p class="neutral" data-key="a">A</p>')
                        key=0;
                    }
                    if (key > 5000) {
                        $('.showkeys').append('<p class="neutral" data-key="c">C</p>')
                        key=0;
                    }
                }

                function writeScore(num) {
                    score += num;
                    $('#score').text(score)
                }

                if (song === "scandalbaby") {
                    bpmConverted = 923;
                    //randomize bpmConverted here
                    var intervalID = setInterval(playNotes, bpmConverted);
                } else if (song === "shunkansentimental") {
                    bpmConverted = 714.3;
                    var intervalID = setInterval(playNotes, bpmConverted);
                }
                
                songAudio.addEventListener('ended', () => {
                    clearInterval(intervalID); 
                    endGame(score);
                });
            })
    }

    function endGame(score) {
        $('.showkeys').hide();
        $('.scoreh2').css('font-size', '50px;')
        $('.giveupbutton').text('Return')
    }
})